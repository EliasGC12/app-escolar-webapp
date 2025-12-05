import { Component, OnInit } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { AdministradoresService } from 'src/app/services/administradores.service';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent implements OnInit {

  // Variables iniciales (se sobrescribirán al cargar los datos)
  lineChartData: any = {
    labels: [],
    datasets: []
  };
  lineChartOption = { responsive: false };
  lineChartPlugins = [DatalabelsPlugin];

  barChartData: any = {
    labels: [],
    datasets: []
  };
  barChartOption = { responsive: false };
  barChartPlugins = [DatalabelsPlugin];

  pieChartData: any = {
    labels: [],
    datasets: []
  };
  pieChartOption = { responsive: false };
  pieChartPlugins = [DatalabelsPlugin];

  doughnutChartData: any = {
    labels: [],
    datasets: []
  };
  doughnutChartOption = { responsive: false };
  doughnutChartPlugins = [DatalabelsPlugin];

  constructor(
    private administradoresServices: AdministradoresService
  ) { }

  ngOnInit(): void {
    this.obtenerTotalUsers();
  }

  public obtenerTotalUsers() {
    this.administradoresServices.getTotalUsuarios().subscribe(
      (response) => {
        console.log("Total usuarios: ", response);
        // Extraemos los datos del JSON
        const admins = response.admins;
        const maestros = response.maestros;
        const alumnos = response.alumnos;

        // 1. Configurar Gráfica de PIE (Pastel)
        this.pieChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [
            {
              data: [admins, maestros, alumnos],
              backgroundColor: ['#FCFF44', '#F1C8F2', '#31E731'], // Colores personalizados
            }
          ]
        };

        // 2. Configurar Gráfica DOUGHNUT (Dona)
        this.doughnutChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [
            {
              data: [admins, maestros, alumnos],
              backgroundColor: ['#F88406', '#FCFF44', '#31E7E7']
            }
          ]
        };

        // 3. Configurar Gráfica de BARRAS (Ahora muestra usuarios por rol)
        this.barChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [
            {
              data: [admins, maestros, alumnos],
              label: 'Total de Usuarios',
              backgroundColor: [
                '#F88406',
                '#FCFF44',
                '#82D3FB'
              ]
            }
          ]
        };

        // 4. Configurar Gráfica LINEAL (Histograma adaptado a categorías)
        this.lineChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [
            {
              data: [admins, maestros, alumnos],
              label: 'Total de Usuarios',
              backgroundColor: '#F88406'
            }
          ]
        };

      }, (error) => {
        console.log("Error al obtener total de usuarios ", error);
        alert("No se pudo obtener el total de cada rol de usuarios");
    }
  );
  }
}
