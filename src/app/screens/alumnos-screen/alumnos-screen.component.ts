import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss'],
})
export class AlumnosScreenComponent {
  // Variables y métodos del componente
  public name_user: string = '';
  public lista_alumnos: any[] = [];

  constructor(
    public facadeService: FacadeService,
    private alumnoService: AlumnosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Lógica de inicialización aquí
    this.name_user = this.facadeService.getUserCompleteName();

    // Obtenemos los administradores
    this.obtenerAlumnos();
  }
  //Obtener lista de usuarios
  public obtenerAlumnos() {
    this.alumnoService.obtenerListaAlumnos().subscribe(
      (response) => {
        this.lista_alumnos = response;
        console.log('Lista users: ', this.lista_alumnos);
      },
      (error) => {
        alert('No se pudo obtener la lista de alumnos');
      }
    );
  }
  public goEditar(idUser: number) {
    this.router.navigate(['registro-usuarios/alumnos/' + idUser]);
  }

  public delete(idUser: number) {}
}
