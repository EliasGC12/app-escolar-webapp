import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { MatRadioChange } from '@angular/material/radio';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { AlumnosService } from 'src/app/services/alumnos.service';

@Component({
  selector: 'app-registro-materias-screen',
  templateUrl: './registro-materias-screen.component.html',
  styleUrls: ['./registro-materias-screen.component.scss'],
})
export class RegistroMateriasScreenComponent implements OnInit {
  public tipo: string = 'registro-materias';
  public editar: boolean = false;
  public rol: string = '';
  public idMateria: number = 0;

  //Banderas para el tipo de usuario
  public isAdmin: boolean = false;
  public isAlumno: boolean = false;
  public isMaestro: boolean = false;

  public tipo_user: string = '';

  //JSON para el usuario
  public user: any = {};

  constructor(
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    public facadeService: FacadeService
  ) {}

  ngOnInit(): void {
    //Revisar si se está editando o creando un usuario
    if (this.activatedRoute.snapshot.params['rol'] != undefined) {
      this.rol = this.activatedRoute.snapshot.params['rol'];
      console.log('Rol detectado: ', this.rol);
    }

    //El if valida si existe un parámetro en la URL
    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      //Asignamos a nuestra variable global el valor del ID que viene por la URL
      this.idMateria = this.activatedRoute.snapshot.params['id'];
      console.log('ID Materia: ', this.idMateria);
      //Al iniciar la vista obtiene el usuario por su ID
      // this.obtenerUserByID();
    }
  }

  //Función para obtener el usuario por su ID
  public obtenerMateriaByID() {}

  //Función para regresar a la pantalla anterior
  public goBack() {
    this.location.back();
  }
}
