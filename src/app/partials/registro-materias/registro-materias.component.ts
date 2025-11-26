import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { MaestrosService } from 'src/app/services/maestros.service';
import { MateriasService } from 'src/app/services/materias.service';

@Component({
  selector: 'app-registro-materias',
  templateUrl: './registro-materias.component.html',
  styleUrls: ['./registro-materias.component.scss'],
})
export class RegistroMateriasComponent implements OnInit {
  @Input() datos_materia: any = {};

  public materia: any = {
    nombre: '',
    nrc: '',
    seccion: '',
    dias: [],
    hora_inicial: '',
    hora_final: '',
    carrera: '',
    profesor: '',
    salon: '',
    creditos: '',
  };
  public errors: any = {};
  public editar: boolean = false;
  public token: string = '';
  public idMateria: number = 0;

  // Patrón para solo letras y espacios
  public customPatterns = {
    A: { pattern: new RegExp('[a-zA-ZáéíóúÁÉÍÓÚñÑ ]') },
  };

  // Patrón para caracteres alfanuméricos y espacios
  public alfanumerico = {
    S: { pattern: new RegExp('[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]') },
  };

  onTimeChange(): void {
    // Limpiar errores primero
    delete this.errors.hora_final;
    delete this.errors.hora_inicial;

    // Solo validar si ambas horas están presentes
    if (!this.materia.hora_inicial || !this.materia.hora_final) {
      return;
    }

    // Comparación simple de strings en formato HH:mm (24 horas)
    if (this.materia.hora_inicial >= this.materia.hora_final) {
      this.errors.hora_final =
        'La hora de finalización debe ser mayor que la hora de inicio';
    }
  }

  //Para el select
  public carreras: any[] = [
    { value: '1', viewValue: 'Ingeniería en Ciencias de la Computación' },
    { value: '2', viewValue: 'Licenciatura en Ciencias de la Computación' },
    { value: '3', viewValue: 'Ingeniería en Tecnologías de la Información' },
  ];

  public dias: any[] = [
    { value: '1', nombre: 'Lunes' },
    { value: '2', nombre: 'Martes' },
    { value: '3', nombre: 'Miércoles' },
    { value: '4', nombre: 'Jueves' },
    { value: '5', nombre: 'Viernes' },
  ];

  public maestros: any[] = [];

  constructor(
    private router: Router,
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private facadeService: FacadeService,
    private materiasService: MateriasService,
    private maestrosService: MaestrosService
  ) {}

  ngOnInit(): void {
    this.token = this.facadeService.getSessionToken();
    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      //Asignamos a nuestra variable global el valor del ID que viene por la URL
      this.idMateria = this.activatedRoute.snapshot.params['id'];
      console.log('ID Materia: ', this.idMateria);
      //Al iniciar la vista obtenemos la materia por su ID
      this.obtenerMateriaByID();
    } else {
      this.editar = false;
      this.materia = this.materiasService.esquemaMateria();
    }
    console.log('Datos materia: ', this.materia);
    this.obtenerMaestros();
  }

  public regresar() {
    this.location.back();
  }

  public obtenerMaestros() {
    this.maestrosService.obtenerListaMaestros().subscribe(
      (response) => {
        this.maestros = response;
        console.log('Lista de maestros: ', this.maestros);
      },
      (error) => {
        alert('No se pudo obtener la lista de maestros');
        console.error('Error al obtener maestros: ', error);
      }
    );
  }

  public obtenerMateriaByID() {
    this.materiasService.obtenerMateriaById(this.idMateria).subscribe(
      (response) => {
        this.materia = response;
        console.log('Materia obtenida: ', this.materia);

        // Parsear dias si viene como string JSON
        if (typeof this.materia.dias === 'string') {
          try {
            this.materia.dias = JSON.parse(this.materia.dias);
          } catch (e) {
            console.error('Error parsing dias:', e);
            this.materia.dias = [];
          }
        } else if (!this.materia.dias) {
          this.materia.dias = [];
        }
      },
      (error) => {
        console.log('Error: ', error);
        alert('No se pudo obtener la materia seleccionada');
      }
    );
  }

  public revisarSeleccion(nombre: string) {
    if (this.materia.dias) {
      var busqueda = this.materia.dias.find((element) => element == nombre);
      if (busqueda != undefined) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  // Funciones para los checkbox
  public checkboxChange(event: any) {
    console.log('Evento: ', event);
    if (event.checked) {
      this.materia.dias.push(event.source.value);
    } else {
      console.log(event.source.value);
      this.materia.dias.forEach((materia, i) => {
        if (materia == event.source.value) {
          this.materia.dias.splice(i, 1);
        }
      });
    }
    console.log('Array materias: ', this.materia.dias);
  }

  public registrar() {
    //Validamos si el formulario está lleno y correcto
    this.errors = {};
    this.errors = this.materiasService.validarMateria(this.materia);
    if (Object.keys(this.errors).length > 0) {
      return false;
    }

    // Preparar datos - convertir horas si tienen AM/PM
    const materiaData = { ...this.materia };

    // Formatear horas para Django (HH:mm:ss) y convertir a 24h
    ['hora_inicial', 'hora_final'].forEach((campo) => {
      if (materiaData[campo] && materiaData[campo].includes(' ')) {
        const [time, modifier] = materiaData[campo].split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12' && modifier === 'AM') hours = '00';
        if (modifier === 'PM' && hours !== '12')
          hours = String(parseInt(hours, 10) + 12);
        materiaData[campo] = `${hours.padStart(2, '0')}:${minutes}:00`;
      } else if (materiaData[campo] && !materiaData[campo].endsWith(':00')) {
        materiaData[campo] = `${materiaData[campo]}:00`;
      }
    });

    this.materiasService.registrarMateria(materiaData).subscribe(
      (response) => {
        // Redirigir o mostrar mensaje de éxito
        alert('Materia registrada exitosamente');
        console.log('Materia registrada: ', response);
        if (this.token && this.token !== '') {
          this.router.navigate(['materias']);
        } else {
          this.router.navigate(['/']);
        }
      },
      (error) => {
        // Manejar errores de la API
        alert('Error al registrar materia');
        console.error('Error al registrar materia: ', error);
      }
    );
  }

  public actualizar() {
    // Validación de los datos
    this.errors = {};
    this.errors = this.materiasService.validarMateria(this.materia);
    if (Object.keys(this.errors).length > 0) {
      return false;
    }

    // Preparar datos - convertir horas si tienen AM/PM
    const materiaData = { ...this.materia };

    // Formatear horas para Django (HH:mm:ss) y convertir a 24h
    ['hora_inicial', 'hora_final'].forEach((campo) => {
      if (materiaData[campo] && materiaData[campo].includes(' ')) {
        const [time, modifier] = materiaData[campo].split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12' && modifier === 'AM') hours = '00';
        if (modifier === 'PM' && hours !== '12')
          hours = String(parseInt(hours, 10) + 12);
        materiaData[campo] = `${hours.padStart(2, '0')}:${minutes}:00`;
      } else if (materiaData[campo] && !materiaData[campo].endsWith(':00')) {
        materiaData[campo] = `${materiaData[campo]}:00`;
      }
    });

    // Ejecutamos el servicio de actualización
    this.materiasService.actualizarMateria(materiaData).subscribe(
      (response) => {
        alert('Materia actualizada exitosamente');
        console.log('Materia actualizada: ', response);
        this.router.navigate(['materias']);
      },
      (error) => {
        alert('Error al actualizar materia');
        console.error('Error al actualizar materia: ', error);
      }
    );
  }

  //Función para detectar el cambio de fecha
  // public changeFecha(event: any) {
  //   console.log(event);
  //   console.log(event.value.toISOString());

  //   this.maestro.fecha_nacimiento = event.value.toISOString().split('T')[0];
  //   console.log('Fecha: ', this.maestro.fecha_nacimiento);
  // }

  // Funciones para los checkbox
  // public checkboxChange(event: any) {
  //   console.log('Evento: ', event);
  //   if (event.checked) {
  //     this.maestro.materias_json.push(event.source.value);
  //   } else {
  //     console.log(event.source.value);
  //     this.maestro.materias_json.forEach((materia, i) => {
  //       if (materia == event.source.value) {
  //         this.maestro.materias_json.splice(i, 1);
  //       }
  //     });
  //   }
  //   console.log('Array materias: ', this.maestro);
  // }

  // public revisarSeleccion(nombre: string) {
  //   if (this.maestro.materias_json) {
  //     var busqueda = this.maestro.materias_json.find(
  //       (element) => element == nombre
  //     );
  //     if (busqueda != undefined) {
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   } else {
  //     return false;
  //   }
  // }

  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Permitir solo letras (mayúsculas y minúsculas) y espacio
    if (
      !(charCode >= 65 && charCode <= 90) && // Letras mayúsculas
      !(charCode >= 97 && charCode <= 122) && // Letras minúsculas
      charCode !== 32 // Espacio
    ) {
      event.preventDefault();
    }
  }
}
