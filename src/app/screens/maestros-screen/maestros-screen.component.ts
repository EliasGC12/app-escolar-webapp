import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  inject,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { EditarUserModalComponent } from 'src/app/modals/editar-user-modal/editar-user-modal.component';
import { FacadeService } from 'src/app/services/facade.service';
import { MaestrosService } from 'src/app/services/maestros.service';

@Component({
  selector: 'app-maestros-screen',
  templateUrl: './maestros-screen.component.html',
  styleUrls: ['./maestros-screen.component.scss'],
})
export class MaestrosScreenComponent implements OnInit, AfterViewInit {
  // Inyección de dependencias
  private facadeService = inject(FacadeService);
  private maestrosService = inject(MaestrosService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  public name_user: string = '';
  public rol: string = '';
  public token: string = '';
  public lista_maestros: any[] = [];

  //Para la tabla
  displayedColumns: string[] = [
    'id_trabajador',
    'nombre_completo',
    'email',
    'fecha_nacimiento',
    'telefono',
    'rfc',
    'cubiculo',
    'area_investigacion',
    'editar',
    'eliminar',
  ];
  dataSource = new MatTableDataSource<DatosUsuario>(
    this.lista_maestros as DatosUsuario[]
  );

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

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
    //Obtener maestros
    this.obtenerMaestros();
  }

  // Consumimos el servicio para obtener los maestros
  //Obtener maestros
  public obtenerMaestros() {
    this.maestrosService.obtenerListaMaestros().subscribe(
      (response) => {
        this.lista_maestros = response;
        console.log('Lista users: ', this.lista_maestros);
        if (this.lista_maestros.length > 0) {
          //Agregar datos del nombre e email
          this.lista_maestros.forEach((usuario) => {
            usuario.first_name = usuario.user.first_name;
            usuario.last_name = usuario.user.last_name;
            usuario.email = usuario.user.email;
            usuario.nombre_completo = `${usuario.user.first_name} ${usuario.user.last_name}`;
          });
          console.log('Maestros: ', this.lista_maestros);

          this.dataSource = new MatTableDataSource<DatosUsuario>(
            this.lista_maestros as DatosUsuario[]
          );

          // Configurar sortingDataAccessor para campos calculados
          this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
              case 'id_trabajador':
                return item.id_trabajador;
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
            data: DatosUsuario,
            filter: string
          ) => {
            const searchStr = filter.toLowerCase();
            return (
              String(data.id_trabajador).toLowerCase().includes(searchStr) ||
              data.nombre_completo.toLowerCase().includes(searchStr)
            );
          };
        }
      },
      (error) => {
        console.error('Error al obtener la lista de maestros: ', error);
        alert('No se pudo obtener la lista de maestros');
      }
    );
  }

  public goEditar(idUser: number) {
    // Solo administradores pueden editar
    if (this.rol === 'administrador') {
      const dialogRef = this.dialog.open(EditarUserModalComponent, {
        data: { id: idUser, rol: 'maestro' },
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.isEdit) {
          this.router.navigate(['registro-usuarios/maestros/' + idUser]);
        }
      });
    } else {
      alert('Solo los administradores pueden editar maestros.');
    }
  }

  public delete(idUser: number) {
    // Solo administradores pueden eliminar
    if (this.rol === 'administrador') {
      //Si es administrador o es maestro, es decir, cumple la condición, se puede eliminar
      const dialogRef = this.dialog.open(EliminarUserModalComponent, {
        data: { id: idUser, rol: 'maestro' }, //Se pasan valores a través del componente
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.isDelete) {
          console.log('Maestro eliminado');
          alert('Maestro eliminado correctamente.');
          window.location.reload();
        } else {
          alert('Maestro no se ha podido eliminar.');
          console.log('No se eliminó el maestro');
        }
      });
    } else {
      alert('Solo los administradores pueden eliminar maestros.');
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
//Esto va fuera de la llave que cierra la clase
export interface DatosUsuario {
  id: number;
  id_trabajador: number;
  first_name: string;
  last_name: string;
  nombre_completo: string;
  email: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
  fecha_nacimiento: string;
  telefono: string;
  rfc: string;
  cubiculo: string;
  area_investigacion: number;
}
