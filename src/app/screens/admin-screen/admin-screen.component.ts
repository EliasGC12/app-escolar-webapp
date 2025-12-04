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
import { AdministradoresService } from 'src/app/services/administradores.service';
import { FacadeService } from 'src/app/services/facade.service';

export interface DatosAdmin {
  id: number;
  clave_admin: string;
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
  selector: 'app-admin-screen',
  templateUrl: './admin-screen.component.html',
  styleUrls: ['./admin-screen.component.scss'],
})
export class AdminScreenComponent implements OnInit, AfterViewInit {
  // Inyección de dependencias
  private facadeService = inject(FacadeService);
  private administradoresService = inject(AdministradoresService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  // Variables y métodos del componente
  public name_user: string = '';
  public lista_admins: any[] = [];
  public rol: string = '';

  displayedColumns: string[] = [
    'clave_admin',
    'nombre_completo',
    'email',
    'rfc',
    'ocupacion',
    'editar',
    'eliminar',
  ];
  dataSource = new MatTableDataSource<DatosAdmin>(
    this.lista_admins as DatosAdmin[]
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
    // Obtenemos los administradores
    this.obtenerAdmins();
  }

  //Obtener lista de usuarios
  public obtenerAdmins() {
    this.administradoresService.obtenerListaAdmins().subscribe(
      (response) => {
        this.lista_admins = response;
        console.log('Lista users: ', this.lista_admins);

        if (this.lista_admins.length > 0) {
          // Agregar campo nombre_completo
          this.lista_admins.forEach((admin) => {
            admin.nombre_completo = `${admin.user.first_name} ${admin.user.last_name}`;
          });

          this.dataSource = new MatTableDataSource<DatosAdmin>(
            this.lista_admins as DatosAdmin[]
          );

          // Configurar sortingDataAccessor para campos calculados
          this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
              case 'clave_admin':
                return item.clave_admin;
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
            data: DatosAdmin,
            filter: string
          ) => {
            const searchStr = filter.toLowerCase();
            return (
              data.clave_admin.toLowerCase().includes(searchStr) ||
              data.nombre_completo.toLowerCase().includes(searchStr)
            );
          };
        }
      },
      (error) => {
        alert('No se pudo obtener la lista de administradores');
      }
    );
  }

  public goEditar(idUser: number) {
    // Solo administradores pueden editar
    if (this.rol === 'administrador') {
      const dialogRef = this.dialog.open(EditarUserModalComponent, {
        data: { id: idUser, rol: 'administrador' },
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.isEdit) {
          this.router.navigate(['registro-usuarios/administrador/' + idUser]);
        }
      });
    } else {
      alert('Solo los administradores pueden editar administradores.');
    }
  }

  public delete(idUser: number) {
    // Solo administradores pueden eliminar
    if (this.rol === 'administrador') {
      //Si es administrador o es maestro, es decir, cumple la condición, se puede eliminar
      const dialogRef = this.dialog.open(EliminarUserModalComponent, {
        data: { id: idUser, rol: 'administrador' }, //Se pasan valores a través del componente
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.isDelete) {
          console.log('Administrador eliminado');
          alert('Administrador eliminado correctamente.');
          window.location.reload();
        } else {
          alert('Administrador no se ha podido eliminar.');
          console.log('No se eliminó el administrador');
        }
      });
    } else {
      alert('Solo los administradores pueden eliminar administradores.');
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
