/*
* Color.js library

*  Copyright (c) 2002-2009, Petr Stanicek, pixy@pixy.cz ("the author")
*  All rights reserved.
*
*  Redistribution and use in source and binary forms, with or without
*  modification, are permitted provided that the following conditions are met:
*   * Redistributions of source code must retain the above copyright
*     notice, this list of conditions and the following disclaimer.
*   * Redistributions in binary form must reproduce the above copyright
*     notice, this list of conditions and the following disclaimer in the
*     documentation and/or other materials provided with the distribution.
*   * Any commercial use of this software is not allowed unless an exemption
*     was granted by the author.
*
*  This software is provided by the author "as is" and any express or implied
*  warranties, including, but not limited to, the implied warranties or
*  merchantability and fitness for a particular purpose are disclaimed.
*  In no event shall the author be liable for any direct, indirect, incidental,
*  special, exemplary, or consequential damages (including, but not limited to,
*  procurement of substitute goods or services; loss of use, data, or profits;
*  or business interruption) however caused and on any theory of liability,
*  whether in contract, strict liability, or tort (including negligence or
*  otherwise) arising in any way out of the use of this software, even if
*  advised of the possibility of such damage.

*/


// Supporting objects


function HSV(H,S,V) {
	this.set = function(H,S,V ) { this.H = H; this.S = S; this.V = V }
	this.copy = function() { return new HSV(this.H,this.S,this.V) }
	// constructor
	this.set(H,S,V);
	}

function RGB(R,G,B) {
	this.set = function(R,G,B) { this.R = Math.round(R); this.G = Math.round(G); this.B = Math.round(B) }
	this.copy = function() { return new RGB(this.R,this.G,this.B) }
	this.toWebCol = function() {
		this.R = Math.round(this.R/51)*51;
		this.G = Math.round(this.G/51)*51;
		this.B = Math.round(this.B/51)*51;
		}
	this.getCSS = function() { return 'rgb('+this.R+','+this.G+','+this.B+')' }
	this.getHex = function() { return dec2hex(this.R)+dec2hex(this.G)+dec2hex(this.B) }
	// constructor
	this.set(R,G,B);
	}

var Primary = {
	R:  { RGB : new RGB(255,  0,  0), HSV : new HSV(  0, 1,   1) },
	RG: { RGB : new RGB(255,255,  0), HSV : new HSV(120, 1,   1) },
	G:  { RGB : new RGB(  0,255,  0), HSV : new HSV(180, 1,   0.8) },
	GB: { RGB : new RGB(  0,255,255), HSV : new HSV(210, 1,   0.6) },
	B:  { RGB : new RGB(  0,  0,255), HSV : new HSV(255, 0.85,0.7) },
	BR: { RGB : new RGB(255,  0,255), HSV : new HSV(315, 1,   0.65) }
	}

function gInc(a,b,k) { return (k==-1) ? a : a + (b-a)/(1+k) }
function gDec(a,b,k) { return (k==-1) ? b : b + (a-b)/(1+k) }

var ColorWheel = {

	getArc : function(h) {
		if (h<120) return this.RRG;
		if (h<180) return this.RGG;
		if (h<210) return this.GGB;
		if (h<255) return this.GBB;
		if (h<315) return this.BBR;
		return this.BRR;
		},
	RRG : {
		a: Primary.R,
		b: Primary.RG,
		f:function(h) {
			// -1 means +INF
			if (h==0) return -1;
			return Math.tan((120-h)/120*Math.PI/2)*0.5
			},
		fi:function(k) {
			if (k==-1) return 0;
			return 120-Math.atan(k/0.5)*120/Math.PI*2
			},
		g: gInc,
		orderRGB:function(max,mid,min) { return new RGB(max,mid,min) }
		},
	RGG : {
		a: Primary.RG,
		b: Primary.G,
		f:function(h) {
			if (h==180) return -1;
			return Math.tan((h-120)/60*Math.PI/2)*0.5
			},
		fi:function(k) {
			if (k==-1) return 180;
			return 120+Math.atan(k/0.5)*60/Math.PI*2
			},
		g: gDec,
		orderRGB:function(max,mid,min) { return new RGB(mid,max,min) }
		},
	GGB : {
		a: Primary.G,
		b: Primary.GB,
		f:function(h) {
			if (h==180) return -1;
			return Math.tan((210-h)/30*Math.PI/2)*0.75
			},
		fi:function(k) {
			if (k==-1) return 180;
			return 210-Math.atan(k/0.75)*30/Math.PI*2
			},
		g: gInc,
		orderRGB:function(max,mid,min) { return new RGB(min,max,mid) }
		},
	GBB : {
		a: Primary.GB,
		b: Primary.B,
		f:function(h) {
			if (h==255) return -1;
			return Math.tan((h-210)/45*Math.PI/2)*1.33
			},
		fi:function(k) {
			if (k==-1) return 255;
			return 210+Math.atan(k/1.33)*45/Math.PI*2
			},
		g: gDec,
		orderRGB:function(max,mid,min) { return new RGB(min,mid,max) }
		},
	BBR : {
		a: Primary.B,
		b: Primary.BR,
		f:function(h) {
			if (h==255) return -1;
			return Math.tan((315-h)/60*Math.PI/2)*1.33
			},
		fi:function(k) {
			if (k==-1) return 255;
			return 315-Math.atan(k/1.33)*60/Math.PI*2
			},
		g: gInc,
		orderRGB:function(max,mid,min) { return new RGB(mid,min,max) }
		},
	BRR : {
		a: Primary.BR,
		b: Primary.R,
		f:function(h) {
			if (h==0) return -1;
			return Math.tan((h-315)/45*Math.PI/2)*1.33
			},
		fi:function(k) {
			if (k==-1) return 0;
			return 315+Math.atan(k/1.33)*45/Math.PI*2
			},
		g: gDec,
		orderRGB:function(max,mid,min) { return new RGB(max,min,mid) }
		},

	getBaseColorByHue : function(H) {
		H = H % 360;
		var S,V,arc = this.getArc(H);
		var k = arc.f(H);
		V = arc.g(arc.a.HSV.V,arc.b.HSV.V,k);
		S = arc.g(arc.a.HSV.S,arc.b.HSV.S,k);
		return { HSV: new HSV(H,S,V), RGB: this._getRGB(H,S,V,arc,k) }
		},

	getRGB : function(H,S,V) {
		var arc = this.getArc(H);
		var k = arc.f(H);
		return this._getRGB(H,S,V,arc,k);
		},
	_getRGB : function(H,S,V,arc,k) {
		var max, mid, min, RGB = arc.a.RGB;
		max = Math.max(RGB.R,Math.max(RGB.G,RGB.B));
		max = max*V;
		min = max*(1-S);
		if (k==-1) mid = min;
		else mid = (max+min*k)/(1+k);
		return arc.orderRGB(max,mid,min);
		},

	getColorByRGB : function(rgb) {
		var H,S,V;
		if (rgb.R==rgb.B && rgb.R==rgb.G) {
			H = 0; S = 0; V = getLum(rgb);
			}
		else {
			var max, mid, min, arc, k;
			max = Math.max(rgb.R,Math.max(rgb.G,rgb.B));
			min = Math.min(rgb.R,Math.min(rgb.G,rgb.B));
			if (max==rgb.R) {
				if (min==rgb.B) {
					mid = rgb.G;
					arc = this.RRG;
					}
				else {
					mid = rgb.B;
					arc = this.BRR;
					}
				}
			else if (max==rgb.G) {
				if (min==rgb.R) {
					mid = rgb.B;
					arc = this.GGB;
					}
				else {
					mid = rgb.R;
					arc = this.RGG;
					}
				}
			else {
				if (min==rgb.R) {
					mid = rgb.G;
					arc = this.GBB;
					}
				else {
					mid = rgb.R;
					arc = this.BBR;
					}
				}
			if (mid==min) k = -1;
			else k = (max-mid)/(mid-min);
			H = arc.fi(k);
			S = (max-min)/max;
			V = max/255;
			}
		return new HSV(H,S,V);
		}

	}



// Models

var Model = {
	// S1,S2 = Secondary, C = Complementary
	m1 : {
	// mono
		getH : function(h,a) { return {} },
		getD : function(h,a) { return 0 }
		},
	m2 : {
	// complement
		getH : function(h,a) { return { C : (h+180)%360 } },
		getD : function(h,a) { return 0 }
		},
	m3 : {
	// triad
		getH : function(h,a) { return { S1 : (h+a+180)%360, S2 : (h-a+540)%360 } },
		minD : 5,
		maxD : 90,
		getD : function(h,a) {
			var d = Math.abs(angleDiff(h+180,a));
			if (d<this.minD) d = this.minD;
			if (d>this.maxD) d = this.maxD;
			return d;
			}
		},
	m4 : {
	// tetrad
		getH : function(h,a) { return { C : (h+180)%360, S1 : (h+a+360)%360, S2 : (h+a+540)%360 } },
		minD : 5,
		maxD : 90,
		getD : function(h,a) {
			var d,d1,ad,ad1;
			d = angleDiff(h,a); ad = Math.abs(d);
			d1 = angleDiff(h+180,a); ad2 = Math.abs(d1);
			if (ad1<ad) d = d1;
			if (ad<this.minD) d = d>=0 ? this.minD : -this.minD;
			if (ad>this.maxD) d = d>=0 ? this.maxD : -this.maxD;
			return d;
			}
		},
	m5 : {
	// analog
		getH : function(h,a) { return { S1 : (h+a)%360, S2 : (h-a+360)%360 } },
		minD : 5,
		maxD : 90,
		getD : function(h,a) {
			var d = Math.abs(angleDiff(h,a));
			if (d<this.minD) d = this.minD;
			if (d>this.maxD) d = this.maxD;
			return d;
			}
		},
	m6 : {
	// analog + complement
		getH : function(h,a) { return { C : (h+180)%360, S1 : (h+a)%360, S2 : (h-a+360)%360 } },
		minD : 5,
		maxD : 90,
		getD : function(h,a) {
			var d = Math.abs(angleDiff(h,a));
			if (d<this.minD) d = this.minD;
			if (d>this.maxD) d = this.maxD;
			return d;
			}
		}
	}


// Contrast

var CModel = {
	shadow : [
		{ dS:-0.5, dV:-0.5 },
		{ dS:1, dV:-0.7 }
		],
	light : [
		{ dS:-0.5, dV:1 },
		{ dS:-0.9, dV:1 }
		],
	get : function(cS,cL) {
		// c = 0..1
		var i, arr = [];
		arr.push({ dS : this.shadow[0].dS * cS, dV : this.shadow[0].dV * cS });
		arr.push({ dS : this.shadow[1].dS * cS, dV : this.shadow[1].dV * cS });
		arr.push({ dS : this.light[0].dS * cL, dV : this.light[0].dV * cL });
		arr.push({ dS : this.light[1].dS * cL, dV : this.light[1].dV * cL });
		return arr;
		}
	}

function ColorVar(H,dS,dV,Contrast,ContrastOverlay) {	
	this.getVariant = function(base,dS,dV) {
		function calc(x,d) { return (d<=0) ? x * (d+1) : x + (1-x)*d };
		var hsv = new HSV(base.H,calc(base.S,dS),calc(base.V,dV));
		var rgb = ColorWheel.getRGB(hsv.H,hsv.S,hsv.V);
		return { HSV : hsv, RGB : rgb };
		}
	this.getOverlayVariant = function(base,S,V) {
		var hsv = new HSV(base.H,S,V);
		var rgb = ColorWheel.getRGB(hsv.H,hsv.S,hsv.V);
		return { HSV : hsv, RGB : rgb };
		}
	this.setCol = function(n,dS,dV) { this.Col[n] = this.getVariant(this.Col0.HSV,dS,dV) }
	this.getVarHSV = function(n) { return this.Col[n].HSV }
	this.getVarRGB = function(n) { return this.Col[n].RGB }

	// constructor
	this.H = H;
	this.Base = ColorWheel.getBaseColorByHue(H);
	this.Col0 = this.getVariant(this.Base.HSV,dS,dV);
	this.Col = [];
	if (ContrastOverlay[0]) {
		this.Col.push( this.getOverlayVariant(this.Base.HSV, ContrastOverlay[0][0], ContrastOverlay[0][1]) );
		}
	else {
		this.Col.push( this.Col0 );
		}
	for (var i=0,l=Contrast.length;i<l;i++) {
		if (ContrastOverlay[i+1]) {
			this.Col[i+1] = this.getOverlayVariant( this.Base.HSV, ContrastOverlay[i+1][0], ContrastOverlay[i+1][1] );
			}
		else {
			this.Col[i+1] = this.getVariant( this.Col0.HSV, Contrast[i].dS, Contrast[i].dV );
			}
		}
	}

// Palette

var Palette = {
	
	Scheme : 'm1',
	SchemeModel : Model['m1'],
	H : 0,
	Dist : 30,
	dS : 0,
	dV : 0,
	cS : 0.5,
	cL : 0.5,
	ContrastModel : CModel.get(0.5,0.5),
	UseVarsOverlay : false,
	VarsOverlay : [[],[],[],[]],

	setScheme : function (m) {
		this.Scheme = m;
		this.SchemeModel = Model[this.Scheme];
		this.resetVarsOverlay(false);
		if (this.Sec1) this.setDist(this.Sec1.H);
		},
	setHue : function (h) {
		if (this.H===h) return false;
		this.H = Math.round(h)%360;
		this.resetVarsOverlay(false);
		return true;
		},
	setHSV : function (hsv) {
		this.setHue(hsv.H);
		var base = this.Primary.Base.HSV;
		if (base.S==0) this.dS = 0;
		else {
			if (hsv.S>base.S) this.dS = (hsv.S-base.S)/(1-base.S)
			else this.dS = hsv.S / base.S - 1;
			}
		if (base.V==0) this.dV = 0;
		else {
			if (hsv.V>base.V) this.dV = (hsv.V-base.V)/(1-base.V)
			else this.dV = hsv.V / base.V - 1;
			}
		this.resetVarsOverlay(false);
		},
	setDist : function (a) {
		this.Dist = this.SchemeModel.getD(this.H,a);
		this.resetVarsOverlay(false);
		return true;
		},
	setDistNum : function (a) {
		this.Dist = a;
		this.resetVarsOverlay(false);
		return true;
		},
	setSV : function (dS,dV) {
		this.dS = dS;
		this.dV = dV;
		this.resetVarsOverlay(false);
		},
	setContrast : function (cS,cL) {
		this.UseVarsOverlay = false;
		this.cS = cS;
		this.cL = cL;
		this.ContrastModel = CModel.get(cS,cL);
		this.resetVarsOverlay(false);
		},
	resetVarsOverlay : function (silent) {
		this.UseVarsOverlay = false;
		this.VarsOverlay = [[],[],[],[]];
		if (!silent) this.update();
		},
	setVarOverlay : function (colNr,varNr,dS,dV,silent) {
		this.UseVarsOverlay = true;
		this.VarsOverlay[colNr][varNr] = [dS,dV];
		if (!silent) this.update();
		},
	getVarOverlay : function (colNr,varNr) {
		var v = this.VarsOverlay[colNr][varNr];
		if (v) return v;
		var c = this.getColorByIdx(colNr).Col[varNr].HSV;
		return [c.S,c.V];
		},

	update : function(secOnly) {
		var hues = this.SchemeModel.getH(this.H,this.Dist);
		if (!secOnly) {
			this.Primary = new ColorVar( this.H, this.dS, this.dV, this.ContrastModel, this.VarsOverlay[0] );
			this.Compl = hues.C==undefined ? null : new ColorVar( hues.C, this.dS, this.dV, this.ContrastModel, this.VarsOverlay[3] );
			}
		this.Sec1 = hues.S1==undefined ? null : new ColorVar( hues.S1, this.dS, this.dV, this.ContrastModel, this.VarsOverlay[1] );
		this.Sec2 = hues.S2==undefined ? null : new ColorVar( hues.S2, this.dS, this.dV, this.ContrastModel, this.VarsOverlay[2] );
		},

	serialize : function () {
		var s = '';
		s += myB64.encodeInt( this.H, 2 );
		s += this.Scheme.substring(1);
		s += myB64.encodeInt( this.Dist+90, 2 );
		s += myB64.encodeFloat( (this.dS+1)/2, 2 );
		s += myB64.encodeFloat( (this.dV+1)/2, 2 );
		s += myB64.encodeFloat( this.cS, 2 );
		s += myB64.encodeFloat( this.cL, 2 );
		if (this.UseVarsOverlay) {
			var i,j;
			for (i=0;i<4;i++) {
				for (j=0;j<5;j++) {
					if (this.VarsOverlay[i][j]) {
						s += myB64.encodeInt(8*i+j,1);		// 8*colNr + varNr; [2,3] => 2*8+3=19
						s += myB64.encodeFloat( (this.VarsOverlay[i][j][0]+1)/2, 2 );	// dS
						s += myB64.encodeFloat( (this.VarsOverlay[i][j][1]+1)/2, 2 );	// dV
						}
					}
				}
			}
		return s;
		},

	unserialize : function (str) {
		var a, arr = [];
		var k = 0;
		// 2 int - Hue
		a = str.substring(k,k+2);
		a = myB64.decodeInt(a);
		if (a>=0 && a<360) arr.push(a);
		else return false;
		k += 2;

		// 1 - Model
		a = 'm' + str.substring(k,k+1);
		if (Model[a]) arr.push(a);
		else return false;
		k += 1;

		// 2 int - Dist
		a = str.substring(k,k+2);
		a = myB64.decodeInt(a)-90;
		if (a>=-90 && a<=90) arr.push(a);
		else return false;
		k += 2;

		// 2 float - dS
		a = str.substring(k,k+2);
		a = myB64.decodeFloat(a,2,5)*2-1;
		if (a>=-1 && a<=1) arr.push(a);
		else return false;
		k += 2;

		// 2 float - dV
		a = str.substring(k,k+2);
		a = myB64.decodeFloat(a,2,5)*2-1;
		if (a>=-1 && a<=1) arr.push(a);
		else return false;
		k += 2;

		// 2 float - cS
		a = str.substring(k,k+2);
		a = myB64.decodeFloat(a,2,5);
		if (a>=0 && a<=1) arr.push(a);
		else return false;
		k += 2;

		// 2 float - cL
		a = str.substring(k,k+2);
		a = myB64.decodeFloat(a,2,5);
		if (a>=0 && a<=1) arr.push(a);
		else return false;
		k += 2;

		this.setAll(arr[1],arr[0],arr[2],arr[3],arr[4],arr[5],arr[6]);

		if (str.length>k) {
			var colNr,varNr,S,V;

			while (str.length>k) {
				// 1 int - idx
				a = str.substring(k,k+1);
				a = myB64.decodeInt(a);
				colNr = Math.floor(a/8);
				varNr = a-colNr*8;
				if (colNr<0 || colNr>3 || varNr<0 || varNr>4) return false;
				k += 1;
				// 2 float - S
				a = str.substring(k,k+2);
				S = myB64.decodeFloat(a,2,5)*2-1;
				if (S<-1 || S>1) return false;
				k += 2;
				// 2 float - V
				a = str.substring(k,k+2);
				V = myB64.decodeFloat(a,2,5)*2-1;
				if (V<-1 || V>1) return false;
				k += 2;
				this.setVarOverlay(colNr,varNr,S,V,true);
				}

			this.update();
			}
		},

	setAll : function (model,h,d,dS,dV,cS,cL) {
		this.Scheme = model;
		this.SchemeModel = Model[this.Scheme];
		this.H = h;
		this.Dist = d;
		this.dS = dS;
		this.dV = dV;
		this.cS = cS;
		this.cL = cL;
		this.ContrastModel = CModel.get(this.cS,this.cL);
		this.resetVarsOverlay();
		},

	Presets : [
	 	{	id : 'default',
			name : 'Default scheme',
			dS : 0, dV : 0, cS : 0.5, cL : 0.5
			},
	 	{	id : 'hcontrast1',
			name : 'More Contrast',
			dS : -0.1, dV : -0.1, cS : 0.66, cL : 0.66
			},
	 	{	id : 'hcontrast2',
			name : 'High Contrast',
			dS : -0.1, dV : -0.1, cS : 0.75, cL : 0.75
			},
	 	{	id : 'hcontrast3',
			name : 'Max Contrast',
			dS : 1, dV : 1, cS : 1, cL : 1
			},
	 	{	id : 'lcontrast1',
			name : 'Less Contrast',
			dS : 0, dV : 0, cS : 0.33, cL : 0.33
			},
	 	{	id : 'lcontrast2',
			name : 'Low Contrast',
			dS : 0, dV : 0, cS : 0.2, cL : 0.2
			},
	 	{	id : 'lcontrast3',
			name : 'Min Contrast',
			dS : 0, dV : 0, cS : 0.1, cL : 0.1
			},
	 	{	id : 'msatur',
			name : 'Medium Dark (saturated)',
			dS : 0.5, dV : -0.44, cS : 0.4, cL : 0.4
			},
	 	{	id : 'dsatur',
			name : 'Dark (saturated)',
			dS : 1, dV : -0.7, cS : 0.25, cL : 0.25
			},
	 	{	id : 'vdsatur',
			name : 'Very Dark (saturated)',
			dS : 1, dV : -0.8, cS : 0.1, cL : 0.1
			},
	 	{	id : 'pastel',
			name : 'Pastel',
			dS : -0.44, dV : -0.125, cS : 0.25, cL : 0.25
			},
	 	{	id : 'mpastel',
			name : 'Medium Dark Pastel',
			dS : -0.44, dV : -0.44, cS : 0.25, cL : 0.25
			},
	 	{	id : 'dpastel',
			name : 'Dark Pastel',
			dS : -0.44, dV : -0.7, cS : 0.25, cL : 0.25
			},
	 	{	id : 'vdpastel',
			name : 'Very Dark Pastel',
			dS : -0.44, dV : -0.8, cS : 0.1, cL : 0.1
			},
	 	{	id : 'palepastel',
			name : 'Light Pale Pastel',
			dS : -0.75, dV : -0.1, cS : 0.1, cL : 0.1
			},
	 	{	id : 'mpalepastel',
			name : 'Medium Pale Pastel',
			dS : -0.75, dV : -0.44, cS : 0.1, cL : 0.1
			},
	 	{	id : 'dpalepastel',
			name : 'Dark Pale Pastel',
			dS : -0.75, dV : -0.7, cS : 0.1, cL : 0.1
			},
	 	{	id : 'vdpalepastel',
			name : 'Very Dark Pale Pastel',
			dS : -0.8, dV : -0.8, cS : 0.05, cL : 0.05
			},
	 	{	id : 'lgray',
			name : 'Almost Grays (light)',
			dS : -0.95, dV : -0.1, cS : 0.1, cL : 0.1
			},
	 	{	id : 'lagray',
			name : 'Almost Grays with Color Accents (light)',
			dS : -0.95, dV : -0.1, cS : 0.5, cL : 0.5
			},
	 	{	id : 'mgray',
			name : 'Almost Grays (medium)',
			dS : -0.95, dV : -0.44, cS : 0.1, cL : 0.1
			},
	 	{	id : 'magray',
			name : 'Almost Grays with Color Accents (medium)',
			dS : -0.95, dV : -0.44, cS : 0.5, cL : 0.5
			},
	 	{	id : 'dgray',
			name : 'Almost Grays (dark)',
			dS : -0.95, dV : -0.8, cS : 0.1, cL : 0.1
			},
	 	{	id : 'dagray',
			name : 'Almost Grays with Color Accents (dark)',
			dS : -0.95, dV : -0.8, cS : 0.5, cL : 0.5
			}
		],
	
	getPreset : function (id) {
		for (var i=0,l=this.Presets.length;i<l;i++) if (this.Presets[i].id==id) return this.Presets[i];
		return this.Presets[0];
		},
	usePreset : function (id) {
		this.resetVarsOverlay();
		var p = this.getPreset(id);
		this.setSV(p.dS,p.dV);
		this.setContrast(p.cS,p.cL);
		},
	getColorByIdx : function(n) {
		var arr = ['Primary','Sec1','Sec2','Compl'];
		if (!arr[n]) n = 0;
		return this[arr[n]];
		}

	}

Palette.update();



// Utils

function dec2hex(n,len) {
	if (!len) len = 2;
	var s = n.toString(16);
	while (s.length<len) s = '0'+s;
	return s.toUpperCase();
	}
function hex2dec(n) {
	return parseInt(n,16);
	}
function flags2dec(arr) {
	var b = 0;
	for (var i=0;i<8;i++) if (arr[i]) b |= Math.pow(2,i);
	return b;
	}
function dec2flags(n) {
	var arr = [];
	for (var i=0;i<8;i++) arr[i] = n & Math.pow(2,i);
	return arr;
	}
function rgb2hex(RGB) {
	return dec2hex(RGB.R)+dec2hex(RGB.G)+dec2hex(RGB.B);
	}
function getLum(RGB) {
	return lum = (RGB.R*0.299 + RGB.G*0.587 + RGB.B*0.114) / 255;
	}
function col2Gray(RGB) {
	var lum = Math.round(getLum(RGB)*255);
	return rgb2hex({R:lum,G:lum,B:lum});
	}

function angleDiff(a,b) {
	// a,b = 0..360
	if (b-a>180) a += 360;
	else if (a-b>180) b += 360;
	return b-a;
	}

var myB64 = {
	_key : '0123456789abcdefghijklmnopqrstuvwxyz.ABCDEFGHIJKLMNOPQRSTUVWXYZ-',
	_pad : '0000000000000000',

	encodeInt : function (n,len) {
		var s = '', i, x = n;
		if (!n) s = '0';
		while (x) {
			i = x & 63;
			s = this._key.charAt(i) + s;
			x >>= 6;
			}
		if (len) {
			s = this._pad + s;
			s = s.substring(s.length-len);
			}
		return s;
		},
	decodeInt : function (s) {
		var a,i,n = 0;
		if (!s) return 0;
		for (var i=0,l=s.length;i<l;i++) {
			n <<= 6;
			a = this._key.indexOf(s.charAt(i));
			n |= a;
			}
		return n;
		},
	encodeFloat : function (x,len) {
		if (!len) len = 1;
		var n = Math.round( (Math.pow(64,len)-1) * x );
		return this.encodeInt(n,len);
		},
	decodeFloat : function (s,len,dec) {
		var n = this.decodeInt(s);
		if (!n) return 0;
		var x = n / (Math.pow(64,len)-1);
		if (dec) {
			var k = Math.pow(10,dec);
			x = Math.round(x*k)/k;
			}
		return x;
		}
	}


// ColorBlind class

var ColorBlind = {

	getHex : function (r,g,b,type) {
		function aprox(start,end,c0,cmid) { return Math.round( start - Math.abs((c0-cmid)/51)*(start-end) ) }
		// convert to webcolors
		var r0 = Math.round(r/51) * 51;
		var g0 = Math.round(g/51) * 51;
		var b0 = Math.round(b/51) * 51;
		var r2 = (r0<r) ? r0+51 : ( (r0>r) ? r0-51 : r0 );
		var g2 = (g0<g) ? g0+51 : ( (g0>g) ? g0-51 : g0 );
		var b2 = (b0<b) ? b0+51 : ( (b0>b) ? b0-51 : b0 );
		// find adjacent colors in table
		var col1 = this.colTbl[dec2hex(r0)+dec2hex(g0)+dec2hex(b0)][type];
		var col2 = this.colTbl[dec2hex(r2)+dec2hex(g2)+dec2hex(b2)][type];
		// normalize by source color
		var rr = aprox(hex2dec(col1.substring(0,2)),hex2dec(col2.substring(0,2)),r0,r);
		var gg = aprox(hex2dec(col1.substring(2,4)),hex2dec(col2.substring(2,4)),g0,g);
		var bb = aprox(hex2dec(col1.substring(4,6)),hex2dec(col2.substring(4,6)),b0,b);
		return dec2hex(rr)+dec2hex(gg)+dec2hex(bb);
		},

	typeDesc : [
	
		],

	colTbl : {
		
	
		}

	}