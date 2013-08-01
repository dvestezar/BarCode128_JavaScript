//v1.0 by Dvestezar
function html_barcode128(p){
//vstup je pole
// jediný povinný údaj je "pole.b" který obsahuje řetězec z kódem
// nepovinné parametry (pokud nejsou zadány, tak jsou nastaveny na default)
// pole.w= šířka jedné linky(základ 2)
// pole.h= výška kódu (základ 30)
// pole.j= jednotky jako string : px,mm in .... pokud není použito, tak je základ px
// pole.tx= true pro zobrazení textu pod kódem , false zakáže, default je true
// pole.c=  pokud true, striktně dodrží sadu C (číslo) tak, že pokud je lichý počet čísel, tak před
//			první číslici přidá nulu, musí být také dodrženo, že nezjistí v řetězci jiné znaky jak 0-9
//			pokud je false je pro číslo použita zada C ALE pokud má lichý počet je pro poslední znak sada přepnuta na sadu B
//			default je false

// stačí volat html_barcode128({b:'test')
// nebo html_barcode128({b:'test',w:1,h:25,j:'mm'}) pro definici čáry

	//pro sadu C je 0=00 až 99=99, potom je jen 100=CodeB, 101=CodeA a 102=FNC1, není třeba definovat
	//pro sadu B hodnota znaku může být 32-126, pro spec kódy je 200-211
	//definice překladu sad
	c = new Array(
		'212222','222122','222221','121223','121322','131222','122213','122312','132212','221213','221312','231212','112232','122132','122231','113222','123122','123221',
		'223211','221132','221231','213212','223112','312131','311222','321122','321221','312212','322112','322211','212123','212321','232121','111323','131123','131321',
		'112313','132113','132311','211313','231113','231311','112133','112331','132131','113123','113321','133121','313121','211331','231131','213113','213311','213131',
		'311123','311321','331121','312113','312311','332111','314111','221411','431111','111224','111422','121124','121421','141122','141221','112214','112412','122114',
		'122411','142112','142211','241211','221114','413111','241112','134111','111242','121142','121241','114212','124112','124211','411212','421112','421211','212141',
		'214121','412121','111143','111341','131141','114113','114311','411113','411311','113141','114131','311141','411131','211412','211214','211232','2331112'
	)
	var sc={A:103,B:104,C:105}, stop=106, BtoC=99, CtoB=100, ChkDiv=103; //sc=StartCode
	var x,i;
  
	//test vstupních nepovinných parametrů a definice default
	if(p.h==undefined){p.h=30};
	if(p.w==undefined){p.w=2};
	if(p.j==undefined){p.j='px'};
	if(p.tx==undefined){p.tx=true};
	if(p.c==undefined){p.c=false};
 
	var b=String(p.b);
	if(b.length<1)return 'Není zadán barcode';
	var nmb=true;
	//test na povolené znaky a jestli to není jen číslo jako řetězec
	//povolené jsou jen code 32-126 -- spec kódy 200-211 může použít jen tato funkce
	for(i=0;i<b.length;i++){
		x=b.charCodeAt(i);
		if((x<32)||(x>126)) return 'Nepovolené znaky v kódu';
		if((x<48)||(x>57)) nmb=false; //pokud řetězec obsahuje jiný znak jak číslo nastav na false, že se nejdná o čisté číslo
	}
	if (nmb && (b.length<4)) nmb=false; //pokud je délka čísla pod 4 (mimo strikní číselný režim viz.dále) tak nemá smysl kódovat jako code128C
	if (nmb){
		if(p.c){
			nmb=true;//pokud je vyžadován strikní číselný a řetězec je číslo, tak bude použita sada C
					// a číslo zarovnáno na sudý počet
			if((b.length%2)!=0) b='0'+b;//pokud lichý počet, přidej nulu před řetězec, při striktním režimu
					// protože v čísleném vyjátření nula před číslem jako by nebyla
		}
	}
	var w = '';//řetězec pro překlad
	var a=1;//počitadlo
	var s = nmb ? sc.C : sc.B; //start code jako první údaj do checksum=s
	var e=-1;//jen pro nmb posl.znak
	var ln=b.length;
	if(nmb){
		//generuj přes sadu C
		if((ln%2)!=0){
			ln -=1;
			e=b.charCodeAt(ln)-32;//pokud lichý počet, tak bude poslední znak interpretován přes sadu B
		}
		//generuj
		for(i=0;i<ln;i=i+2){
			x=b.substr(i,2)*1;
			w += c[x];
			s += a * x;
			a+=1;
		}
		w = c[sc.C] + w;//označ jako code128C
		// popř přepni na codeB a přidej znak navíc(oprav chesum)
		if(e>-1){
			s += (a*CtoB)+((a+1)*e);
			w += c[CtoB] + c[e];
		}
	}else{
		//generuj přes sadu B
		for (i=0;i<ln;i++){
			x=b.charCodeAt(i)-32;
			w += c[x];
			s += a * x;//znak mezery je nula code 32-32
			a+=1;
		}
		w = c[sc.B] + w;//označ jako code128B
	}
	w = '06'+w+c[s % ChkDiv] + c[stop] + '0'+'06';//+ checksum + stop + "0" (0 pro sudý počet následné smyčky for)
			//'06' je mezera před a po kódu
	//vykresli barcode
	var astr = ''; //výsledný HTML řetězec
	s=0;//celková šířka tabulky ke které bude přišteno 4 * pole.w (4 šírky linky)
	for (i = 0; i < w.length; i=i+2) {
		astr+='<div style="height:'+p.h+p.j+';border-left:'+(w.charAt(i)*p.w)+p.j+' solid black;width:'+(w.charAt(i+1)*p.w)+p.j+'"></div>';
		s += ((w.charAt(i)*1)*p.w)+((w.charAt(i+1)*1)*p.w); // celková šířka
	}
	s=s+(p.w*4);//přidej šířku 4 linek
	x='';// jen pro příp.zobrazení přeloženého řetězce jako "212131...." - kontrola/debug
	//odděl každý 6 znak pro přehlednost - kontrola
	/*for(i=0;i<w.length;i++){
		x += w.charAt(i);
		if(((i+1)%6)==0) x += '/';
	}
	x='<br>'+x;*/
	//uzavření do tabulky - label kódu je v "p.b"
	b=p.tx?('<tr class="code128tr"><td class="code128tdtx">'+p.b+x+'</td></tr>'):'';
	return '<table class="code128tbl" style="width:'+s+p.j+'"><tr><td class="code128tdcd">'+astr+'</td></tr>'+b+'</table>';
}
