import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { FacadeService } from 'src/app/services/facade.service';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { EditarUserModalComponent } from 'src/app/modals/editar-user-modal/editar-user-modal.component';

export interface DatosAlumno {
  id: number;
  matricula: string;
  nombre_completo: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
  rfc: string;
  ocupacion: string;
}

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss'],
})
export class AlumnosScreenComponent implements OnInit, AfterViewInit {
  // Inyección de dependencias
  private facadeService = inject(FacadeService);
  private alumnoService = inject(AlumnosService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  // Variables y métodos del componente
  public name_user: string = '';
  public rol: string = '';
  public token: string = '';
  public lista_alumnos: any[] = [];

  displayedColumns: string[] = [
    'matricula',
    'nombre_completo',
    'email',
    'rfc',
    'ocupacion',
    'editar',
    'eliminar',
  ];
  dataSource = new MatTableDataSource<DatosAlumno>(
    this.lista_alumnos as DatosAlumno[]
  );

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

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

        if (this.lista_alumnos.length > 0) {
          // Agregar campo nombre_completo
          this.lista_alumnos.forEach((alumno) => {
            alumno.nombre_completo = `${alumno.user.first_name} ${alumno.user.last_name}`;
          });

          this.dataSource = new MatTableDataSource<DatosAlumno>(
            this.lista_alumnos as DatosAlumno[]
          );

          // Configurar sortingDataAccessor para campos calculados
          this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
              case 'matricula':
                return item.matricula;
              case 'nombre_completo':
                return item.nombre_completo;
              default:
                return (item as any)[property];
            }
          };

          // Usar setTimeout para asegurar que sort y paginator se conecten
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });

          // Configurar filtro personalizado
          this.dataSource.filterPredicate = (
            data: DatosAlumno,
            filter: string
          ) => {
            const searchStr = filter.toLowerCase();
            return (
              data.matricula.toLowerCase().includes(searchStr) ||
              data.nombre_completo.toLowerCase().includes(searchStr)
            );
          };
        }
      },
      (error) => {
        alert('No se pudo obtener la lista de alumnos');
      }
    );
  }
  public goEditar(idUser: number) {
    // Solo administradores pueden editar
    if (this.rol === 'administrador') {
      const dialogRef = this.dialog.open(EditarUserModalComponent, {
        data: { id: idUser, rol: 'alumno' },
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.isEdit) {
          this.router.navigate(['registro-usuarios/alumnos/' + idUser]);
        }
      });
    } else {
      alert('Solo los administradores pueden editar alumnos.');
    }
  }

  public delete(idUser: number) {
    // Solo administradores pueden eliminar
    if (this.rol === 'administrador') {
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
          window.location.reload();
        } else {
          alert('Alumno no se ha podido eliminar.');
          console.log('No se eliminó el alumno');
        }
      });
    } else {
      alert('Solo los administradores pueden eliminar alumnos.');
    }
  }

  // Método para aplicar filtro
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
