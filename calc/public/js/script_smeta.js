$(document).ready(function (){
    localStorage.setItem('smeta', "");
    var price = new Price();

$('.day').text(userClientData[0].days)
    getParsingAnArray(userClientData)

    function Price(){
        this.square_obrezkov = 80;
        this.angleCount = 30;
        this.curvilinearLength = 400;
        this.innerCutoutLength = 400;
    }

    $(document).on( "click",".photoCeiling",function(e) {
        e.preventDefault();
        imgId = $(this).attr('data-img')
        if($(this).hasClass('open')) {
            $('#img-'+imgId).slideUp();
            $(this).removeClass('open')
        } else {
            $(this).addClass('open')
            $('#img-'+imgId).slideDown()
        }
    });
    function getParsingAnArray(orderNumberOll){

        $('.table').empty()
        saveSmeta_ = ''
        $.each(orderNumberOll,function(ind,val){

            saveSmeta += dopUslugi(val);



            if (val.room_area<3){
                val.room_area = 3
            }
            if (!Array.isArray(val.smeta)){
                if (val.smeta !=undefined){
                    $.each(val.smeta,function(indS,valueS){
                        console.log(val)
                        id = indS.replace('id-','')
                        if (listNameOfWorks.find(o => o.id == id ).kinds == 0){
                            saveSmeta  += "<tr><td>"+ listNameOfWorks.find(o => o.id == id ).name +"</td><td>"+ valueS +"</td><td>"+ listNameOfWorks.find(o => o.id == id).unit+"</td><td>"+ listNameOfWorks.find(o => o.id == id).price + "</td> <td class='resultR-"+ ind +"'>"+ (Number(valueS)*Number(listNameOfWorks.find(o => o.id == id).price)) +"</td> </tr> "

                        }else {
                            if (valueS != 0){
                                saveSmeta_  += "<tr><td>"+ listNameOfWorks.find(o => o.id == id ).name +"<br><img style='width: 100px; margin-left: 25px; padding: 10px; border: 1px solid black; border-radius: 10px;' src='/template/images/material/"+listNameOfWorks.find(o => o.id == id ).photo+"'></td><td>"+ valueS +"</td><td>"+ listNameOfWorks.find(o => o.id == id).unit+"</td><td>"+ listNameOfWorks.find(o => o.id == id).price + "</td> <td class='resultM-"+ ind +"'>"+ (Number(valueS)*Number(listNameOfWorks.find(o => o.id == id).price)) +"</td> </tr> "

                            }

                        }
                    })
                }
            }
            if (val.price_updates != 0){
                val.price = val.price_updates
            }

            $('.table').append("<thead class='thead'> 	<tr> 	 	<td class='tdroom' colspan='5'>Помещение: "+ val.room +" <img data-img='"+val.id+"' style='width: 24px; cursor: pointer;margin-left: 10px' class='photoCeiling flare-button'  src='/template/images/icon/plans.png' ></td> 	</tr> <tr> <td colspan='5' style='text-align: center;margin: 0 auto' > <div style='display: none' id='svg-"+val.id+"'>"+val.calc_img_svg+"</div><img id='img-"+val.id+"' src='' style='display:none;max-height: 200px;max-width: 100%;' ></td></tr> <tr> 	 	<td class='tdroom_' colspan='5'>Работы</td> 	</tr>	<tr> 	 	<th scope='col'>Наименование</th> 	<th scope='col'>Кол-во</th> 	 	<th scope='col'>Ед.</th> 		 	<th scope='col'>Цена</th> 		 	<th scope='col'>Сумма</th> 	 	</tr> </thead> <tbody class='tbody' id='tbody_app-"+ ind +"'> 	<tr> 	 		<td class='tdManufacture' ><span style=''>"+ val.manufacturer+" </span><span class='hex' style='background-color: #"+val.hex+";padding:5px;color:#000;font-weight: bold;font-size: 14px;border: 1px solid black;margin-left: 5px;'>"+ val.color +"</span>"+"</td> 	 		<td>"+ val.room_area +"</td> 		<td>M<sup>2</sup></td> 	 		<td>"+ val.price +"</td> 	 		<td class='resultR-"+ ind +"'>"+ Number(Number(val.room_area)*Number(val.price)).toFixed(2) +"</td> 	 	</tr> 	"+ saveSmeta +"  	<tr> 		<td class='tdItog' style='text-align: right!important;' colspan='4'>Итого работ:</td> 		<td class='itogR-"+ ind +"'></td> 	</tr> <tr> 	 	<td class='tdroom_' style='text-align: center!important;' colspan='5'>Дополнительные материалы</td> 	</tr>"+saveSmeta_+"<tr> 		<td class='tdItog' style='text-align: right!important;' colspan='4'>Итого материалов:</td> 		<td class='itogM-"+ ind +"'></td> 	</tr></tbody>")
            var svg = document.querySelector('#svg-'+val.id+'>svg');

            var xml = new XMLSerializer().serializeToString(svg);
            var svg64 = btoa(xml);


            var b64Start = 'data:image/svg+xml;base64,';
            var image64 = b64Start + svg64;

            $('#img-'+val.id).attr('src',image64)
            numR = 0;
            numM = 0;
            $('.resultR-'+ind).each(function() {
                numR = numR + Number($(this).text())

            });
            $('.resultM-'+ind).each(function() {
                numM = numM + Number($(this).text())

            });
            numR = numR+Number($('#AngleCount').text())
            numR = numR+Number($('#curvilinearLength').text())
            numR = numR+Number($('#innerCutoutLength').text())
            $('.itogR-'+ind).text(numR)
            $('.itogR-'+ind).each(function() {
                itogo = itogo + Number($(this).text())
            });
            $('.itogM-'+ind).text(numM)
            $('.itogM-'+ind).each(function() {
                itogo = itogo + Number($(this).text())
            });
            saveSmeta = ''
        })
        $('#tbody_app-'+(orderNumberOll.length-1)).append("<tr> 	<td colspan='4' class='fw-bold fz-12 ta-right ' style='text-align: right!important;'>Итого всего:</td> 	<td class='fw-bold fz-12 ta-right '  id='itogovsego'>"+Number(itogo).toFixed(2)+"</td> </tr>")
    }

    function dopUslugi(val){
        var str = ''
        if (val.square_obrezkov>2){
            str += "<tr><td>Обрезки </td><td>"+(Number(val.square_obrezkov)).toFixed(2)+"</td><td>м<sup>2</sup></td><td>"+price.square_obrezkov+"</td><td id='AngleCount-"+ind+"'>"+(Number(val.square_obrezkov)*price.square_obrezkov).toFixed(2)+"</td></tr>"
        }
        if (val.angles_count>4){
            ang = 4;
            if (Number(val.inner_cutout_length)>0){
                ang = 8;
            }
            str += "<tr><td>Дополнительные углы (больше 4х)</td><td>"+(Number(val.angles_count)-ang)+"</td><td>шт.</td><td>"+price.angleCount+"</td><td id='AngleCount'>"+(Number(val.angles_count)-ang)*price.angleCount+"</td></tr>"
        }
        if (val.curvilinear_length !=0){
            str += "<tr><td>Криволинейный участок</td><td>"+(Number(val.curvilinear_length))+"</td><td>м/п</td><td>"+price.curvilinearLength+"</td><td id='curvilinearLength'>"+(Number(val.curvilinear_length))*price.curvilinearLength+"</td></tr>"
        }
        if (val.inner_cutout_length !=0){
            str += "<tr><td>Внутренний вырез </td><td>"+(Number(val.inner_cutout_length))+"</td><td>м/п</td><td>"+price.innerCutoutLength+"</td><td id='innerCutoutLength'>"+(Number(val.inner_cutout_length))*price.innerCutoutLength+"</td></tr>"
        }


        return str;
    }
})