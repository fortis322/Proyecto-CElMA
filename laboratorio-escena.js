/* Adaptador 3D del laboratorio. El motor científico no depende de Three.js. */
(() => {
  'use strict';
  class CelmaLabScene {
    constructor(view){
      this.view=view;this.T=view.THREE;this.group=new this.T.Group();this.group.name='Laboratorio · estado calculado';view.scene.add(this.group);
      this.curves=(view._model?.userData.cellPaths?.microtubules||[]).map(path=>new this.T.CatmullRomCurve3(path.map(p=>new this.T.Vector3(...p))));
      this.saved=null;this.module=null;this.matrix=new this.T.Matrix4();this.direction=new this.T.Vector3();this.mid=new this.T.Vector3();this.quat=new this.T.Quaternion();this.scale=new this.T.Vector3();this.up=new this.T.Vector3(0,1,0);
    }
    clear(){
      this.group.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();});this.group.clear();
      if(this.saved){this.view._organelleStates=new Map(this.saved.states);this.view.setScientificFocus(this.saved.focus);this.saved=null;}
      this.module=null;this.view._schedule();
    }
    show(module){
      this.clear();this.module=module;
      this.saved={states:new Map([...this.view._organelleStates].map(([k,v])=>[k,{...v}])),focus:this.view._focusComponents?[...this.view._focusComponents]:null};
      const families={microtubules:['microtubules'],actin:['actin'],transport:['microtubules','vesicles','centrosome']};
      this.view.setScientificFocus(families[module]||['microtubules']);
      if(module==='microtubules'){
        this.view.setOrganelleState('microtubules',{visible:false});
        this.segments=this.instances(26*32,.023);this.tips=this.spheres(26,.055);
      }else if(module==='actin'){
        this.view.setOrganelleState('actin',{visible:false});
        this.segments=this.instances(96,.02);this.tips=this.spheres(96,.038);
      }else if(module==='transport'){
        this.view.setOrganelleState('microtubules',{visible:false});this.view.setOrganelleState('vesicles',{visible:false});
        this.segments=this.instances(26*32,.019);this.cargos=this.spheres(64,.09);this.motors=this.spheres(64,.035);this.breaks=this.spheres(52,.047);
      }
    }
    instances(count,radius){
      const T=this.T,mesh=new T.InstancedMesh(new T.CylinderGeometry(radius,radius,1,6),new T.MeshStandardMaterial({color:0xffffff,roughness:.6}),count);
      mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.frustumCulled=false;this.group.add(mesh);return mesh;
    }
    spheres(count,radius){const T=this.T,mesh=new T.InstancedMesh(new T.SphereGeometry(radius,10,7),new T.MeshStandardMaterial({color:0xffffff,roughness:.55}),count);mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.frustumCulled=false;this.group.add(mesh);return mesh;}
    segment(mesh,index,a,b,color,radiusFactor=1){
      this.direction.subVectors(b,a);const length=this.direction.length();this.mid.copy(a).add(b).multiplyScalar(.5);this.quat.setFromUnitVectors(this.up,this.direction.normalize());this.scale.set(radiusFactor,Math.max(.00001,length),radiusFactor);this.matrix.compose(this.mid,this.quat,this.scale);mesh.setMatrixAt(index,this.matrix);mesh.setColorAt(index,new this.T.Color(color));
    }
    sphere(mesh,index,point,color,size=1){this.matrix.compose(point,new this.T.Quaternion(),new this.T.Vector3(size,size,size));mesh.setMatrixAt(index,this.matrix);mesh.setColorAt(index,new this.T.Color(color));}
    update(snapshot){
      if(!snapshot || snapshot.module!==this.module)return;
      if(this.module==='microtubules'){
        let count=0,tips=0;
        for(const filament of snapshot.filaments){
          if(filament.state==='inactive'||filament.length<=0)continue;
          const curve=this.curves[filament.route%this.curves.length];if(!curve)continue;
          const n=Math.max(1,Math.ceil(filament.length*32)),color=filament.state==='shrinking'?'#e8a45e':'#338be0';
          for(let j=0;j<n;j++){const a=curve.getPointAt(filament.length*j/n),b=curve.getPointAt(filament.length*(j+1)/n);this.segment(this.segments,count++,a,b,color);}
          this.sphere(this.tips,tips++,curve.getPointAt(filament.length),color);
        }
        this.segments.count=count;this.tips.count=tips;
        for(const mesh of [this.segments,this.tips]){mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;}
      }else if(this.module==='actin')this.updateActin(snapshot);
      else if(this.module==='transport')this.updateTransport(snapshot);
      this.view._schedule();
    }
    updateActin(snapshot){
      const T=this.T;let count=0;
      for(const filament of snapshot.filaments){
        if(filament.length<=0 || !filament.origin || !filament.direction)continue;
        const a=new T.Vector3(...filament.origin),b=a.clone().addScaledVector(new T.Vector3(...filament.direction),filament.length);
        const color=filament.state==='shrinking'?'#dca573':filament.parentId?'#39bfa8':'#149d89';
        this.segment(this.segments,count,a,b,color);this.sphere(this.tips,count,b,color);count++;
      }
      this.segments.count=count;this.tips.count=count;this.flush([this.segments,this.tips]);
    }
    updateTransport(snapshot){
      let count=0,markers=0;
      const routes=snapshot.routes||[];
      for(const route of routes){
        if(route.available===false)continue;
        const curve=this.curves[Number(route.id ?? route.route)%this.curves.length];if(!curve)continue;
        const start=route.gapStart??.42,end=route.gapEnd??.58;
        for(let j=0;j<32;j++){
          const middle=(j+.5)/32;
          if(!route.intact && middle>start && middle<end)continue;
          this.segment(this.segments,count++,curve.getPointAt(j/32),curve.getPointAt((j+1)/32),route.intact?'#5b9fe7':'#a3bacd');
        }
        if(!route.intact)for(const position of [start,end])this.sphere(this.breaks,markers++,curve.getPointAt(position),'#e8a15d');
      }
      let cargoCount=0;
      for(const cargo of snapshot.vesicles||[]){
        const curve=this.curves[cargo.route%this.curves.length];if(!curve)continue;
        const position=curve.getPointAt(Math.max(0,Math.min(1,cargo.position??cargo.s??0))),color=cargo.state==='waiting'?'#a4b8c9':cargo.state==='blocked'?'#e79a4c':cargo.motor==='dynein1'?'#9a70cd':'#17b4a2';
        this.sphere(this.motors,cargoCount,position,color,cargo.state==='waiting'?.001:1);
        this.sphere(this.cargos,cargoCount,position.clone().add(new this.T.Vector3(0,.12,0)),color,cargo.state==='inactive'?.55:1);cargoCount++;
      }
      this.segments.count=count;this.breaks.count=markers;this.cargos.count=cargoCount;this.motors.count=cargoCount;
      this.flush([this.segments,this.breaks,this.cargos,this.motors]);
    }
    flush(meshes){for(const mesh of meshes){mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;}}
    dispose(){this.clear();this.view.scene.remove(this.group);}
  }
  window.CelmaLabScene=CelmaLabScene;
})();
