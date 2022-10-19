import vBase from "../glsl/base.vert";
import fImage from "../glsl/item.frag";
import { MyObject3D } from "../webgl/myObject3D";
import { Mesh } from 'three/src/objects/Mesh';
import { Util } from "../libs/util";
import { Color } from 'three/src/math/Color';
import { Val } from "../libs/val";
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { DoubleSide } from 'three/src/constants';
import { Conf } from "../core/conf";
import { Tween } from "../core/tween";

export class Item extends MyObject3D {

  private _item:Array<any> = [];

  public tgForm:HTMLElement | null = null;

  constructor(opt:any) {
    super()

    for(let i = 0; i < 6; i++) {
      const m = new Mesh(
        opt.geo,
        new ShaderMaterial({
          vertexShader:vBase,
          fragmentShader:fImage,
          transparent:true,
          side:DoubleSide,
          depthTest:false,
          uniforms:{
            defColor:{value:new Color(i % 2 == 0 ? 0x333333 : 0x222222)},
            color:{value:Util.instance.randomArr(Conf.instance.COLOR)},
            rate:{value:0},
          }
        }),
      );
      this.add(m);

      this._item.push({
        mesh:m,
        showRate:new Val(0),
        changeRate:new Val(0),
      });
    }
    this._item.reverse();
  }


  public change(flg:boolean): void {
    this._item.forEach((val,i) => {
      Tween.instance.a(val.changeRate, {
        val:flg ? 1 : 0,
      }, 0.5, i * 0.05, Tween.Power3EaseOut);
    });
  }


  public show(d:number): void {
    this._item.forEach((val,i) => {
      Tween.instance.a(val.showRate, {
        val:1
      }, 0.5, d + i * 0.015, Tween.SpringA);
    });
  }


  public hide(d:number): void {
    this._item.forEach((val,i) => {
      Tween.instance.a(val.showRate, {
        val:0
      }, 0.5, d + i * 0.05, Tween.ExpoEaseInOut);
    })
  }


  protected _update():void {
    super._update();


    this._item.forEach((val,i) => {
      const m = val.mesh;
      let scale = Util.instance.map(i, 10, 100, 0, this._item.length - 1);
      scale *= Util.instance.mix(0.00001, 1, val.showRate.val);

      m.scale.set(scale, scale, 1);

      m.rotation.z = Util.instance.radian(180 * val.showRate.val);

      // m.visible = val.showRate.val > 0.1;

      this._getUni(m).rate.value = val.changeRate.val;
    })
  }


  protected _resize(): void {
    super._resize();
  }
}