import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../../config/app.config';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  apiVersion: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchApiVersion();
  }

  private fetchApiVersion(): void {
    this.http.get(`${API_CONFIG.BASE_URL}${API_CONFIG.VERSION_ENDPOINT}`)
      .subscribe({
        next: (response: any) => {
          this.apiVersion = response.version;
        },
        error: (error) => {
          console.error('Error fetching API version:', error);
          this.apiVersion = 'Unknown';
        }
      });
  }
}

