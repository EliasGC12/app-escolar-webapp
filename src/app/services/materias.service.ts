import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FacadeService } from './facade.service';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class MateriasService {
  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) {}

  public esquemaMateria() {
    return {
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
  }

  public validarMateria(data: any) {
    console.log('Validando materia... ', data);
    let error: any = [];

    if (!this.validatorService.required(data['nombre'])) {
      error['nombre'] = this.errorService.required;
    }

    if (!this.validatorService.required(data['nrc'])) {
      error['nrc'] = this.errorService.required;
    }

    if (!this.validatorService.required(data['seccion'])) {
      error['seccion'] = this.errorService.required;
    }

    if (!this.validatorService.required(data['carrera'])) {
      error['carrera'] = this.errorService.required;
    }

    if (
      !this.validatorService.required(data['dias']) ||
      data['dias'].length === 0
    ) {
      error['dias'] = this.errorService.required;
    }

    if (!this.validatorService.required(data['hora_inicial'])) {
      error['hora_inicial'] = this.errorService.required;
    }

    if (!this.validatorService.required(data['hora_final'])) {
      error['hora_final'] = this.errorService.required;
    }

    if (!this.validatorService.required(data['profesor'])) {
      error['profesor'] = this.errorService.required;
    }
    if (!this.validatorService.required(data['salon'])) {
      error['salon'] = this.errorService.required;
    }
    if (!this.validatorService.required(data['creditos'])) {
      error['creditos'] = this.errorService.required;
    }

    return error;
  }

  public obtenerListaMaterias(): Observable<any> {
    // Verificamos si existe el token de sesión
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/lista-materias/`, {
      headers,
    });
  }

  //Servicio para obtener una materia por ID
  public obtenerMateriaById(idMateria: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(
      `${environment.url_api}/materias/?id=${idMateria}`,
      {
        headers,
      }
    );
  }

  public registrarMateria(materia: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.post<any>(`${environment.url_api}/materias/`, materia, {
      headers,
    });
  }

  //Servicio para actualizar una materia
  public actualizarMateria(materia: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.put<any>(`${environment.url_api}/materias/`, materia, {
      headers,
    });
  }

  //Servicio para eliminar una materia
  public eliminarMateria(idMateria: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.delete<any>(
      `${environment.url_api}/materias/?id=${idMateria}`,
      { headers }
    );
  }
}
