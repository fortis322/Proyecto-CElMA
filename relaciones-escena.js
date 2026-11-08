/* Animaciones de relaciones: señales didácticas, no datos experimentales. */
(() => {
  'use strict';
  class CelmaRelationScene {
    constructor(view){this.view=view;this.T=view.THREE;this.group=new this.T.Group();this.group.name='Relación científica · capa educativa';view.scene.add(this.group);this.update=()=>{};}
    material(color,opacity=1){return new this.T.MeshBasicMaterial({color,transparent:opacity<1,opacity,depthWrite:false});}
    mesh(geometry,color,opacity=1){const mesh=new this.T.Mesh(geometry,this.material(color,opacity));this.group.add(mesh);return mesh;}
    anchor(key){const point=this.view._model?.userData.anchors?.[key] || [0,.9,0];return new this.T.Vector3(...point);}
    curve(family,target){
      const T=this.T,paths=this.view._model?.userData.cellPaths?.[family] || [];
      let candidates=family==='actin'?paths.slice(0,3):paths;
      const dest=this.anchor(target);
      candidates=[...candidates].sort((a,b)=>new T.Vector3(...a[a.length-1]).distanceTo(dest)-new T.Vector3(...b[b.length-1]).distanceTo(dest));
      const points=candidates[0] || [[0,1,0],[2,.7,1],[4,.4,1.5]];
      return new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
    }
    clear(){this.update=()=>{};this.group.traverse(object=>{object.geometry?.dispose();if(object.material){for(const m of Array.isArray(object.material)?object.material:[object.material])m.dispose();}});this.group.clear();this.view._schedule();}
    show(relation){
      this.clear();this.relation=relation;
      const handlers={transport:()=>this.transport(relation),flow:()=>this.signals(relation),pulse:()=>this.signals(relation),branch:()=>this.signals(relation),spindle:()=>this.division(relation,'spindle'),ring:()=>this.division(relation,'ring')};
      (handlers[relation.animation.kind] || handlers.pulse)();this.setProgress(0);
    }
    transport(relation){
      const T=this.T,curve=this.curve(relation.component,relation.animation.to),mito=relation.animation.to==='mitochondria';
      const cargo=this.mesh(mito?new T.CapsuleGeometry(.12,.3,4,8):new T.SphereGeometry(.12,12,8),mito?'#e7954d':'#f4ac66');
      const motorA=this.mesh(new T.SphereGeometry(.04,8,6),'#d88137'),motorB=this.mesh(new T.SphereGeometry(.04,8,6),'#d88137');
      const points=curve.getPoints(48),line=new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineDashedMaterial({color:'#2677ca',dashSize:.13,gapSize:.09,transparent:true,opacity:.75}));line.computeLineDistances();this.group.add(line);
      this.update=p=>{let f=.07+.84*p;if(relation.component==='actin')f=.16+.23*p;if(relation.animation.motor==='dynein1')f=1-f;const position=curve.getPoint(f);cargo.position.copy(position).add(new T.Vector3(0,.17,0));cargo.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),curve.getTangent(f));motorA.position.copy(position).add(new T.Vector3(.035,.055+Math.sin(p*80)*.018,0));motorB.position.copy(position).add(new T.Vector3(-.035,.055-Math.sin(p*80)*.018,0));};
    }
    signals(relation){
      const T=this.T,rings=relation.participants.map((key,index)=>{const ring=this.mesh(new T.TorusGeometry(.24,.014,5,32),index===0?'#2b8bbd':'#c29ae0',.8);ring.rotation.x=-Math.PI/2;ring.position.copy(this.anchor(key));return ring;});
      this.update=p=>rings.forEach((ring,i)=>{const pulse=(p+i*.21)%1;ring.scale.setScalar(.8+pulse*2.1);ring.material.opacity=.72*(1-pulse);});
    }
    division(relation,kind){
      const T=this.T,inset=new T.Group();inset.position.set(4.1,3.8,0);this.group.add(inset);
      const boundary=new T.Mesh(new T.SphereGeometry(1,32,18),this.material('#d7def8',.16));boundary.scale.set(1.8,.82,1.05);inset.add(boundary);
      const objects=[];
      if(kind==='spindle'){
        for(const side of [-1,1]){
          const pole=new T.Mesh(new T.SphereGeometry(.1,10,8),this.material('#e4b14f'));pole.position.x=side*1.35;inset.add(pole);
          for(let i=0;i<8;i++){const z=(i-3.5)*.17,curve=new T.QuadraticBezierCurve3(new T.Vector3(side*1.35,0,0),new T.Vector3(side*.7,.23,z*1.15),new T.Vector3(0,0,z));const tube=new T.Mesh(new T.TubeGeometry(curve,12,.015,5,false),this.material('#4d94e8'));inset.add(tube);}
        }
        for(let i=0;i<6;i++){const chrom=new T.Mesh(new T.CapsuleGeometry(.045,.16,3,6),this.material('#a275c9'));chrom.position.set(0,.05,(i-2.5)*.19);chrom.rotation.z=.35;inset.add(chrom);objects.push(chrom);}
        this.update=p=>objects.forEach((object,i)=>{object.position.x=Math.sin(p*Math.PI*2)*.45*(i%2?1:-1);});
      }else{
        const ring=new T.Mesh(new T.TorusGeometry(.74,.038,6,40),this.material('#20b79c'));ring.rotation.y=Math.PI/2;inset.add(ring);
        this.update=p=>{const factor=1-.45*Math.sin(p*Math.PI);ring.scale.set(1,factor,factor);boundary.scale.set(1.8,.82-.15*Math.sin(p*Math.PI),1.05);};
      }
    }
    setProgress(progress){this.update(Math.max(0,Math.min(1,Number(progress)||0)));this.view._schedule();}
    dispose(){this.clear();this.view.scene.remove(this.group);}
  }
  window.CelmaRelationScene=CelmaRelationScene;
})();
