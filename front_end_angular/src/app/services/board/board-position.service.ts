import * as THREE from 'three';
import { Injectable, ElementRef, OnDestroy, NgZone } from '@angular/core';
import { MathUtils, EdgesGeometry } from 'three';
import { ElasticService } from '../elastic/elastic.service';
import { Acc } from '../../object-models/acc.model';

@Injectable({ providedIn: 'root' })
export class BoardPositionService implements OnDestroy {

  private elasticResponse: Acc;
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.AmbientLight;
  private worldAxes: THREE.AxesHelper;
  private cubeAxes: THREE.AxesHelper;

  private cube: THREE.Mesh;

  private frameId: number = null;

  public constructor(private ngZone: NgZone, private elasticService: ElasticService) {}

  public ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {

    // get the reference of the canvas element from our HTML document
    this.canvas = canvas.nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });

    this.renderer.setSize(window.innerWidth/2.5, window.innerHeight/2.75);
    this.renderer.setClearColor( 0x26282b, 3);

    // create the scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0.05, 0, 2.5);
    this.camera.up = new THREE.Vector3(0,1,0);
    this.camera.lookAt(0, 0, 0);
    this.scene.add(this.camera);

    // soft white light
    this.light = new THREE.AmbientLight( 0xa9a9a9 );
    this.light.position.x = 10;
    this.scene.add(this.light);

    const geometry = new THREE.BoxGeometry(1, 0.2, 1.4, 4, 4, 4);
    const cubeMaterials = [
      new THREE.MeshBasicMaterial({color:0x063d8c, transparent:true, opacity:1}),
      new THREE.MeshBasicMaterial({color:0x063d8c, transparent:true, opacity:1}),
      new THREE.MeshBasicMaterial({color:0x0f55b8, transparent:true, opacity:1}),
      new THREE.MeshBasicMaterial({color:0x0f55b8, transparent:true, opacity:1}),
      new THREE.MeshBasicMaterial({color:0x0f55b8, transparent:true, opacity:1}),
      new THREE.MeshBasicMaterial({color:0x0f55b8, transparent:true, opacity:1}),
    ];

    this.cube = new THREE.Mesh( geometry, cubeMaterials );
    let geo = new EdgesGeometry(this.cube.geometry);
    let borders = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 1.5});
    let wireframe = new THREE.LineSegments(geo, borders);
    this.cube.add(wireframe);
    this.worldAxes = new THREE.AxesHelper(2);
    this.cubeAxes = new THREE.AxesHelper(0.9);
    this.cube.add(this.cubeAxes);
    this.scene.add(this.worldAxes);
    this.scene.add(this.cube);
  }

  public animate(): void {
    // This have to run outside angular zones,
    // because it could trigger heavy changeDetection cycles.
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.render();
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.render();
        });
      }

      window.addEventListener('resize', () => {
        this.resize();
      });

      this.canvas.addEventListener('click', () => {

       this.ngZone.run(() => this.elasticService
       .getAcc()
       .subscribe((elResp:Acc) => {
          this.elasticResponse = elResp;
        }))

      });//window
    });//ngZone
  }//animate(

  public render(): void {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });

     if (this.elasticResponse == undefined){
      this.cube.rotation.x += 0.005;
      this.cube.rotation.z += 0.005;
     }else {
      this.cube.rotation.x = MathUtils.degToRad(this.elasticResponse.roll*(-1));  //0.184606781429423;
      this.cube.rotation.z = MathUtils.degToRad(this.elasticResponse.pitch);   //0.7008435977353504;
     }

    this.renderer.render(this.scene, this.camera);
  }

  public resize(): void {
    const width = window.innerWidth/2.5;
    const height = window.innerHeight/2.75;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( width, height );
  }
}
