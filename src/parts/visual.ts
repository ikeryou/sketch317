import { Func } from '../core/func';
import { Canvas } from '../webgl/canvas';
import { Object3D } from 'three/src/core/Object3D';
import { Update } from '../libs/update';
import { Item } from './item';
import { Param } from '../core/param';
import { Tween } from '../core/tween';
import { PlaneGeometry } from 'three/src/geometries/PlaneGeometry';
import { Color } from 'three/src/math/Color';
import { Util } from '../libs/util';
import { Conf } from '../core/conf';
import { HSL } from '../libs/hsl';

export class Visual extends Canvas {

  private _con:Object3D;
  private _item:Array<Item> = [];
  private _formEl:Array<HTMLElement> = [];
  private _bgColor:Color;

  constructor(opt: any) {
    super(opt);

    // 背景色
    const col = Util.instance.randomArr(Conf.instance.COLOR).clone();
    const hsl = new HSL();
    col.getHSL(hsl);
    // hsl.s *= 0.5;
    hsl.l *= 0.05;
    col.setHSL(hsl.h, hsl.s, hsl.l);
    this._bgColor = col;

    this._con = new Object3D();
    this.mainScene.add(this._con);

    // 共通で使う
    const geo = new PlaneGeometry(1, 1);

    for(let i = 0; i < 18; i++) {
      const item = new Item({
        id:i,
        geo:geo,
      })
      this._con.add(item);
      this._item.push(item);
    }

    // ラジオボタンつくる
    const con = document.querySelector('.l-main');
    for(let i = 0; i < this._item.length; i++) {
      const f = document.createElement('input') as HTMLElement;
      f.setAttribute('type', 'checkbox');
      f.setAttribute('name', String(i));
      f.setAttribute('tabindex', String(i + 1));
      con?.append(f);
      this._formEl.push(f);

      f.addEventListener('focus', (e:Event) => {
        this._show(e.currentTarget);
      });
      f.addEventListener('blur', (e:Event) => {
        this._hide(e.currentTarget);
      });
      f.addEventListener('change', (e:Event) => {
        this._eChange(e.currentTarget);
      });

      this._item[i].tgForm = f;
    }

    this._resize()
  }


  private _eChange(e:any): void {
    const key = Number(e.getAttribute('name'))
    const tg = this._item[key];
    if(tg != undefined) {
      tg.change(e.checked);
    }
  }


  private _show(e:any): void {
    const key = Number(e.getAttribute('name'))
    const tg = this._item[key];
    if(tg != undefined) {
      tg.show(0);
    }
  }


  private _hide(e:any): void {
    const key = Number(e.getAttribute('name'))
    const tg = this._item[key];
    if(tg != undefined) {
      tg.hide(0);
    }
  }


  protected _update(): void {
    super._update()

    Param.instance.inputTextNum = 1;

    this._con.position.y = Func.instance.screenOffsetY() * -1;



    if (this.isNowRenderFrame()) {
      this._render()
    }
  }


  private _render(): void {
    this.renderer.setClearColor(this._bgColor, 1);
    this.renderer.render(this.mainScene, this.cameraOrth);
  }


  public isNowRenderFrame(): boolean {
    return this.isRender && Update.instance.cnt % 1 == 0
  }


  _resize(isRender: boolean = true): void {
    super._resize();

    const w = Func.instance.sw();
    const h = Func.instance.sh();

    this.renderSize.width = w;
    this.renderSize.height = h;

    this._updateOrthCamera(this.cameraOrth, w, h);
    this._updatePersCamera(this.cameraPers, w, h);

    let pixelRatio: number = window.devicePixelRatio || 1;

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(w, h);
    this.renderer.clear();

    if (isRender) {
      this._render();
    }

    const line = 6;
    const inputSize = 20;
    this._formEl.forEach((val,i) => {
      const iy = ~~(i / line);
      const ix = i % line;

      let x = ix * (w / line) + (w / line) * 0.5;
      let y = iy * (h / (this._formEl.length / line)) + (h / (this._formEl.length / line)) * 0.5;

      Tween.instance.set(val, {
        // x:i * (w / this._formEl.length) + (w / this._formEl.length) * 0.5,
        // y:h * 0.5 - inputSize * 0.5,
        x:x,
        y:y,
        width:inputSize,
        height:inputSize,
      })

      // 位置合わせる
      const r = this.getOffset(val);
      const mesh = this._item[i];
      mesh.position.x = r.x - w * 0.5 + inputSize * 0.5;
      mesh.position.y = -r.y + h * 0.5 - inputSize * 0.5;
    })
  }
}
