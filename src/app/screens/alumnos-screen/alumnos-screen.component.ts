import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { FacadeService } from 'src/app/services/facade.service';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss'],
})
export class AlumnosScreenComponent {
  // Variables y métodos del componente
  public name_user: string = '';
  public rol: string = '';
  public token: string = '';
  public lista_alumnos: any[] = [];

  constructor(
    public facadeService: FacadeService,
    private alumnoService: AlumnosService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Lógica de inicialización aquí
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    //Validar que haya inicio de sesión
    //Obtengo el token del login
    this.token = this.facadeService.getSessionToken();
    console.log('Token: ', this.token);
    if (this.token == '') {
      this.router.navigate(['/']);
    }
    // Obtenemos los alumnos
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

  public delete(idUser: number) {
    // Se obtiene el ID del usuario en sesión, es decir, quien intenta eliminar
    const userIdSession = Number(this.facadeService.getUserId());
    // --------- Pero el parametro idUser (el de la función) es el ID del alumno que se quiere eliminar ---------
    // Administrador puede eliminar cualquier alumno
    // Alumno solo puede eliminar su propio registro
    if (
      this.rol === 'administrador' ||
      (this.rol === 'alumno' && userIdSession === idUser)
    ) {
      //Si es administrador o es alumno, es decir, cumple la condición, se puede eliminar
      const dialogRef = this.dialog.open(EliminarUserModalComponent, {
        data: { id: idUser, rol: 'alumno' }, //Se pasan valores a través del componente
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.isDelete) {
          console.log('Alumno eliminado');
          alert('Alumno eliminado correctamente.');
          //Recargar página
          window.location.reload();
        } else {
          alert('Alumno no se ha podido eliminar.');
          console.log('No se eliminó el alumno');
        }
      });
    } else {
      alert('No tienes permisos para eliminar este alumno.');
    }
  }
}
