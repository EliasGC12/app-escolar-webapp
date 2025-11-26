import { OnInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FacadeService } from 'src/app/services/facade.service';
import { Router } from '@angular/router';
import { MaestrosService } from 'src/app/services/maestros.service';
import { MateriasService } from 'src/app/services/materias.service';
import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

export interface DatosMateria {
  id: number;
  nrc: string;
  nombre: string;
  seccion: string;
  salon: string;
  programa: string;
  creditos: number;
}

@Component({
  selector: 'app-materias-screen',
  templateUrl: './materias-screen.component.html',
  styleUrls: ['./materias-screen.component.scss'],
})
export class MateriasScreenComponent implements OnInit {
  public lista_materias: any[] = [];
  public name_user: string = '';
  public rol: string = '';
  public token: string = '';

  displayedColumns: string[] = [
    'nrc',
    'nombre',
    'seccion',
    'dias',
    'hora_inicio',
    'hora_fin',
    'salon',
    'programa',
    'profesor',
    'creditos',
    'editar',
    'eliminar',
  ];

  dataSource = new MatTableDataSource<DatosMateria>(
    this.lista_materias as DatosMateria[]
  );

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(
    public facadeService: FacadeService,
    public materiasService: MateriasService,
    public maestrosService: MaestrosService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    //Validar que haya inicio de sesión
    //Obtengo el token del login
    this.token = this.facadeService.getSessionToken();
    console.log('Token: ', this.token);
    if (this.token == '') {
      this.router.navigate(['/']);
    }
    this.obtenerMaterias();
  }

  public obtenerMaterias() {
    this.materiasService.obtenerListaMaterias().subscribe(
      (response) => {
        this.lista_materias = response;
        console.log('Lista materias RAW: ', this.lista_materias);

        // Obtener lista de maestros para mapear los IDs
        this.maestrosService.obtenerListaMaestros().subscribe(
          (maestros) => {
            console.log('Lista maestros: ', maestros);

            if (this.lista_materias.length > 0) {
              // Formatear los datos antes de mostrarlos
              this.lista_materias.forEach((materia) => {
                console.log('Procesando materia: ', materia);

                // Parsear dias si viene como string JSON
                if (typeof materia.dias === 'string') {
                  try {
                    const diasArray = JSON.parse(materia.dias);
                    materia.dias = Array.isArray(diasArray)
                      ? diasArray.join(', ')
                      : materia.dias;
                  } catch (e) {
                    materia.dias = materia.dias;
                  }
                } else if (Array.isArray(materia.dias)) {
                  materia.dias = materia.dias.join(', ');
                }

                // Buscar el nombre del profesor por ID
                console.log('Profesor ID:', materia.profesor);
                const maestro = maestros.find((m) => m.id === materia.profesor);
                if (maestro && maestro.user) {
                  materia.profesor_nombre = `${maestro.user.first_name} ${maestro.user.last_name}`;
                } else {
                  materia.profesor_nombre = 'Sin asignar';
                }
                console.log('Profesor nombre:', materia.profesor_nombre);

                // Formatear horas para mostrar en la tabla (HH:mm)
                if (materia.hora_inicial) {
                  materia.hora_inicio = String(materia.hora_inicial).substring(
                    0,
                    5
                  );
                }
                if (materia.hora_final) {
                  materia.hora_fin = String(materia.hora_final).substring(0, 5);
                }
              });

              console.log('Lista materias procesadas: ', this.lista_materias);

              this.dataSource = new MatTableDataSource<DatosMateria>(
                this.lista_materias as DatosMateria[]
              );
              this.dataSource.paginator = this.paginator;
            }
          },
          (error) => {
            console.error('Error al obtener maestros: ', error);
          }
        );
      },
      (error) => {
        console.error('Error al obtener la lista de materias: ', error);
        alert('No se pudo obtener la lista de materias');
      }
    );
  }

  public goEditar(idMateria: number) {
    this.router.navigate(['registro-materias/' + idMateria]);
  }

  public delete(idMateria: number) {
    const dialogRef = this.dialog.open(EliminarUserModalComponent, {
      data: { id: idMateria, rol: 'materia' },
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDelete) {
        console.log('Materia eliminada');
        alert('Materia eliminada correctamente.');
        window.location.reload();
      } else {
        alert('Materia no se ha podido eliminar.');
        console.log('No se eliminó la materia');
      }
    });
  }
}
