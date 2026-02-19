<script>



    function alignCenter(elem) {
        elem.css({
            left: ($(window).width() - elem.width()-40) / 2  + 'px',
            top: 10  + '%'
        })
    }

    function maxId(myArray,str) {

        max = 0;

          myArray.filter(function(item, index){
              if (item.delete_ceiling != 'true'){
                  if((item.id)-0 >= max){
                      return  max = item.id
                  }
              }
        })

        return max

    }

    function preparationDeliteCeiling(){
        popup_selectRoom = $('#popup_input')
        alignCenter(popup_selectRoom);

        if (newClient.find(item => item.id === ceilingId) === undefined){
            $('.popup_input').text("Нет чертежей для удаления" )
            $('#btn_rename-popup_input').text("Добавить" )
        }else {
            $('.popup_input').text("Удалить чертеж потолка " + rooms.find(item => item.id === newClient.find(item => item.id === ceilingId)['room_id'])['name'] )
            deliteCeilingName = rooms.find(item => item.id === newClient.find(item => item.id === ceilingId)['room_id'])['name']

        }
        popup_selectRoom.show();

    }
    function deliteCeiling(){
        if (newClient.find(item => item.id === ceilingId) === undefined){
            clearElems();
            navShow('main-2')
            return false
        }
          newClient = newClient.filter(function(item, index)  {
            if (item.id == ceilingId){

                item.delete_ceiling = 'true';
            }
            return item;
        })

          selectRoom()
        exitInSmeta()
        new Noty({
            theme: 'relax',
            timeout: 2000,
            layout: 'topCenter',
            type: "success",
            text: "Чертеж потока " + deliteCeilingName + " успешно удален"
        }).show();
        saveStorage()
    }
    function preparationRenameCeiling(){
        popup_selectRoom = $('#popup_selectRoom')
        alignCenter(popup_selectRoom);
        popup_selectRoom.show();
    }
    function renameCeiling(){
        renameSelectRoomID = $('#rename-selectRoom').val()
        newClient.find(item => item.id === ceilingId).room_id = renameSelectRoomID
        newClient.find(item => item.id === ceilingId).update_room = true
        popup_selectRoom = $('#popup_selectRoom')
        popup_selectRoom.hide();
        selectRoom()
        saveStorage()
    }

    function selectRoom(Id = false){
        $('.selectRoom').empty()

        if (!Id){
            ceilingId = maxId(newClient,'id');
        }else {
            ceilingId = Id;
        }

        $.each(newClient,function(ind,val){
            if (val.delete_ceiling != 'true'){
                if (ceilingId == val.id){
                    $('.selectRoom').append('<option selected value="' + val.id + '">' + rooms.find(item => item.id === val.room_id)['name'] + '</option>')
                }else{
                    $('.selectRoom').append('<option  value="' + val.id + '">' + rooms.find(item => item.id === val.room_id)['name'] + '</option>')
                }
            }

        })
        $('.selectRoom').append('<option  value="0">Добавить потолок</option>')
    }




    function saveStorage(){
        localStorage.setItem('newClient', JSON.stringify(newClient));
    }
    function getStorageReturn(){
        if (localStorage.getItem('newClient') != null){
            resGetAjax = getAjax({storage:  localStorage.getItem('newClient'), success: 'getStorage'})
            console.log(resGetAjax)
            userClient = resGetAjax.cl
            userClientAdress = resGetAjax.adress
            if (resGetAjax){
                localStorage.removeItem('newClient');
                alert('newClient уничтожен с localStorage')
            }

        }
    }

    function borderBlue($elem){

        $($elem).css("border","2px solid blue")
    }
    function navShow($elem,$border = false){
        $('#main-1,#main-2,#main-3,#main-4,#main-5,#main-6').hide()
        $('.header-block .icons').css("border","none")
        if ($border == false){
            borderBlue(' [data-includes="'+$elem+'"]');
        }else {
            borderBlue($border)
        }

        if ($elem == 'main-2'){
            $('#popup_client').show()
        }
        if ($elem === $mainShow){
            $('.header-block').hide()
        }else{
            $('.header-block').show()
        }
        $('#'+$elem).show()

    }
    function btn_client_select(){

        boolClientAdress = 0
        clientId = 0
        clientAdressId = 0
        if (userClient === false){
            new Noty({
                theme: 'relax',
                timeout: 2000,
                layout: 'topCenter',
                type: "warning",
                text: "У Вас нет сохраненных клиентов"
            }).show();
            return false
        }else {
            $('#popup_client').hide()
            $('#popup_client_select').show();
            selectClient('name')

        }
    }
    function getRooms(){
        $('#select_client,#rename-selectRoom').empty()
        $.each(rooms,function(ind,val){
            $('#select_client,#rename-selectRoom').append("<option value='"+val.id+"'>"+val.name+"</option>")
        })
        $('#select_client,#rename-selectRoom').append("<option value='0'>Добавить</option>")
    }
    ///
    function getAjax(item){

        jQuery.ajax({
            url: "/",
            async: false,
            data: item,
            dataType: 'json',
            type:"post",

            success: function(data) {


                resultAjax =  data
            },
            error: function(data) {
                resultAjax =  'error'
                new Noty({
                    theme: 'relax',
                    timeout: 2000,
                    layout: 'topCenter',
                    type: "warning",
                    text: "Ошибка передачи данных"
                }).show();
            }

        });

        return resultAjax
    }


    function hideShow(clas,sm = '?'){
        $('.mains,.main,.document,.project-management,.listing,.user,.smeta_').hide()
        $(clas).show()
        if(sm !='?'){
            $(sm).show()
        }
    }

    function getActive($item,$c,$n){
        if ($($item).hasClass('active')){
            $($item).removeClass('active').text($c)
            return boolClientAdress = 0;
        }else{
            $($item).addClass('active').text($n)
            return boolClientAdress = 1;
        }

    }
    function selectClient(str,$clientId = false){
        $('#get_select_client').empty()
        if (str == 'name'){
            $.each(userClient,function(ind,val){
                item = val.name
                values = val.id
                $('#get_select_client').append("<option value='"+values+"'>"+item+"</option>")

            })
        }
        if(str == 'adress'){
            if ($clientId){
                userClientAdress = userClientAdress.filter(item => item.client_id === $clientId)
                boolClientAdress = 1
            }
            $.each(userClientAdress,function(ind,val){

                item = val.adress
                values = val.client_id
                $('#get_select_client').append("<option data_adress='"+ val.id +"' value='"+values+"'>"+item+"</option>")

            })
        }
    }



    function addHeadSmeta($item){
        $item = newClient.find(item => item.id == ceilingId)

        $('#logoImg').attr('src',user.logo_company)
        $('#name-company').text(user.name)
        $('#name-company-adress').text(user.adress)
        $('#name-company-phone').text(user.phone)

            order = user.id + '-' + $item.client_id + '-' + $item.adress_id
        $('#number_order a').attr('href','/calc/'+order)
        keyCeiling = newClient.findIndex(function (record) {

            return record.id === ceilingId;
        });

            if (ceilingOne == true){
                order += '/' + (keyCeiling+1)
            }

        $('#number_order a').text(order)
        $('#days').text($item.days)

        $('#client-smeta').text($('#client').val())
        $('#client-adress-smeta').text($('#client_adress').val())
        $('#client-phone-smeta').text($('#client_phone').val())
    }
    $(document).on("click", "#form-smeta-montaj", function (e) {
        htmlspecificationSmeta = ''
        saveStorage()
        getStorageReturn()
        ceilingOne = false
        ceilingAll = true
        exitInSmetaAll()
        $.each(newClient,function(ind,val){
            ceilingId = val.id
            specificationSmeta(val.id)

            htmlspecificationSmeta += "<div class='container images-block'>"+$('.images-block').html()+"</div><div class=' container specification-block'>"+$('.specification-block').html()+"</div><hr>"
        })
        getAjax({contentHTML:htmlspecificationSmeta,success:'htmlspecificationSmeta',number_order:$('#number_order a').text()})
        console.log(resultAjax)
         $('#resultHREF').empty().append("<div class='container' style='margin-top: 20px;'><a target='_blank' href='" + resultAjax.url + "' class='btn btn-primary btn-lg ' role='button'>"+resultAjax.url+"</a></div>")

    })
    function specificationSmeta($item){
        $item = newClient.find(item => item.id === ceilingId)



        $('#img_hidden').val($item.drawing_data).trigger('change');
        $('#table-walls,#table-diags').empty()
        $('#angles_result').text($item.angles_count);
        $('#perimeter_result').text($item.perimeter);
        $('#area_result').text($item.room_area);
        $('#curvilinear_result').text($item.curvilinear_length);
        $('#inner_cutout_length').text($item.inner_cutout_length);
        $('#color_id').text($item.color_id);
        $('#manufacturer_id').text($item.manufacturer).append('<span class="renameManufacture_id"><img src="../images/icon/Rename.png" style="width: 30px; "></span>');
        $('#texture_id').text($item.texture);
        $('#width_final').text($item.width_final);
        $.each($item.lines_length.walls, function (index, value) {
            $('#table-walls').append('<tr><td>' + value.name + '</td><td>' + value.length + '</td></tr>')
        })
        $.each($item.lines_length.diags, function (index, value) {
            $('#table-diags').append('<tr><td>' + value.name + '</td><td>' + value.length + '</td></tr>')
        })


        
    }
    function getImgCanvas(svgImage,id = false) {
        img = $('#slides');

        $('#calc_img').empty().append(svgImage);
        svg = document.querySelector('svg');

        xml = new XMLSerializer().serializeToString(svg);
        svg64 = btoa(xml);

        b64Start = 'data:image/svg+xml;base64,';
        image64 = b64Start + svg64;

        img.attr('src', image64)

        return image64;
    }

    function worksProductions(item){
    str = '';

        if (item.room_area) {

            if (!item.smeta.find(it=>it.id == 22)){

                item.smeta.push({
                    "id": "22",
                    "name": item.manufacturer,
                    "quantiny": item.room_area,
                    "price": item.price,
                    "price_montaj": item.price_montaj,
                    "edit_price": "false"
                })
                item.updateSmeta = true;
                saveStorage()
            }

        }
        if (item.square_obrezkov > 3 ) {
            if (!item.smeta.find(it=>it.id == 16)){
                item.smeta.push({
                    "id": "16",
                    "quantiny": item.square_obrezkov,
                    "price": types_of_work.find(t=>t.id == 16).price,
                    "price_montaj": types_of_work.find(t=>t.id == 16).price_montaj,
                    "edit_price": "false"
                })
                item.updateSmeta = true;
                saveStorage()
            }

        }
        if (item.angles_count > 4) {
            if (item.inner_cutout_length != 0) {
                item.angles_count = Number(item.angles_count) - 4
            }
            if (Number(item.angles_count) - 4 != 0) {
                if (Number(item.angles_count)<0){
                    if (!item.smeta.find(it=>it.id == 15)){
                        if (!item.smeta.find(it=>it.id == 15)){
                            item.smeta.push({
                                "id": "15",
                                "quantiny": item.angles_count,
                                "price": types_of_work.find(t=>t.id == 15).price,
                                "price_montaj": types_of_work.find(t=>t.id == 15).price_montaj,
                                "edit_price": "false"
                            })
                            item.updateSmeta = true;
                            saveStorage()
                        }

                    }

                }

            }
        }
        if (item.curvilinear_length != 0) {
            if (!item.smeta.find(it=>it.id == 17)){
                item.smeta.push({
                    "id": "17",
                    "quantiny": item.curvilinear_length,
                    "price": types_of_work.find(t=>t.id == 17).price,
                    "price_montaj": types_of_work.find(t=>t.id == 17).price_montaj,
                    "edit_price": "false"
                })
                item.updateSmeta = true;
                saveStorage()
            }

        }
        if (item.inner_cutout_length != 0) {
            if (!item.smeta.find(it=>it.id == 18)){
                item.smeta.push({
                    "id": "18",
                    "quantiny": item.curvilinear_length,
                    "price": types_of_work.find(t=>t.id == 18).price,
                    "price_montaj": types_of_work.find(t=>t.id == 18).price_montaj,
                    "edit_price": "false"
                })
                item.updateSmeta = true;
                saveStorage()
            }
       }

    }


    function materialSmeta(item){
        str = "<tr><td colspan='5' style='font-size: 16px;font-weight: bold;'>Материалы</td></tr>";
        material = "";

        $.each(item.smeta,function(ind,val){
            if (val.edit_price != 'false'){
                val.price = val.edit_price;
            }
            if (types_of_work.find(it=>it.id === val.id) == undefined){
                return;
            }
            if (types_of_work.find(it=>it.id === val.id).kinds == 1){

                material += "<tr class='calculate' data-info='id-" + item.id + "-smeta-" + val.id + "'><td>" + types_of_work.find(it=>it.id === val.id).name + "</td><td class='multiplier' > " + (Number(val.quantiny)).toFixed(2) + " </td><td>" + unit.find(un=>un.id === types_of_work.find(it=>it.id === val.id).id_unit_of_measurement).name + "</td><td class='multiplied' >" + Number(val.price).toFixed(2) + "</td><td class='total-material'>" + (( Number(val.price))*(Number(val.quantiny))).toFixed(2) + "</td></tr>"

            }

        })

        str += material;
        str += "<tr><td style='text-align: right;font-weight: bold;padding: 5px 10px;'  colspan='4'>Итого материалы:</td><td style='font-weight: bold' class='itogo-mateial'></td></tr>"

        if (material != ''){
            return str;
        }

    }

    function worksSmeta(item){
        str = "";
        material1 = "";
        material2 = "";

        $.each(item.smeta,function(ind,val){


            if (smataMontaj == true){
                val.price = types_of_work.find(t=>t.id == val.id).price_montaj
            }
            if (smataMaterial == true){
                val.price = types_of_work.find(t=>t.id == val.id).price
            }
            if (smataClient == true){
                val.price = types_of_work.find(t=>t.id == val.id).price
                if (val.edit_price != 'false'){
                    val.price = val.edit_price;
                }
            }
            if (types_of_work.find(it=>it.id === val.id) == undefined){
                return;
            }
            if (types_of_work.find(it=>it.id === val.id).kinds == 2  ){
                nameMaterial = ''
                if (val.name ) nameMaterial = " "+item.manufacturer
                if (smataMontaj == true ){
                    if ( val.id == 22){
                        material1 += "<tr class='calculate' data-info='id-" + item.id + "-smeta-" + val.id + "'><td>" + types_of_work.find(it=>it.id === val.id).name +nameMaterial+ "</td><td class='multiplier' > " + (Number(val.quantiny)).toFixed(2) + " </td><td>" + unit.find(un=>un.id === types_of_work.find(it=>it.id === val.id).id_unit_of_measurement).name + "</td><td class='multiplied' >" + Number(val.price).toFixed(2) + "</td><td class='total-work'>" + (( Number(val.price))*(Number(val.quantiny))).toFixed(2) + "</td></tr>"

                    }

                }else{
                    material1 += "<tr class='calculate' data-info='id-" + item.id + "-smeta-" + val.id + "'><td>" + types_of_work.find(it=>it.id === val.id).name +nameMaterial+ "</td><td class='multiplier' > " + (Number(val.quantiny)).toFixed(2) + " </td><td>" + unit.find(un=>un.id === types_of_work.find(it=>it.id === val.id).id_unit_of_measurement).name + "</td><td class='multiplied' >" + Number(val.price).toFixed(2) + "</td><td class='total-work'>" + (( Number(val.price))*(Number(val.quantiny))).toFixed(2) + "</td></tr>"

                }


            }
            if (types_of_work.find(it=>it.id === val.id).kinds == 0){

                material2 += "<tr class='calculate' data-info='id-" + item.id + "-smeta-" + val.id + "'><td>" + types_of_work.find(it=>it.id === val.id).name + "</td><td class='multiplier' > " + (Number(val.quantiny)).toFixed(2) + " </td><td>" + unit.find(un=>un.id === types_of_work.find(it=>it.id === val.id).id_unit_of_measurement).name + "</td><td class='multiplied' >" + Number(val.price).toFixed(2) + "</td><td class='total-work'>" + (( Number(val.price))*(Number(val.quantiny))).toFixed(2) + "</td></tr>"

            }

        })

        str += material1 + material2;
        str += "<tr><td style='text-align: right;font-weight: bold;padding: 5px 10px;'  colspan='4'>Итого работы:</td><td style='font-weight: bold' class='itogo-work'></td></tr>"


            return str;


    }
    function itogSmeta(item = false){
        str = "";

        str += "<tr><td style='text-align: right;font-weight: bold;padding: 5px 10px;' colspan='4'>Итого работ и материалов:</td><td style='font-weight: bold' class='itog-vsego'></td></tr>";
        return str;
    }
    function addImagesBlock($item){
        $('#img_hidden').val($item.drawing_data).trigger('change');

        return str = "<tr><td colspan='5' style='font-size: 16px;font-weight: bold;'><div class='w-90' style='text-align: center;margin: 0 auto'><img style='max-width: 100%;' src='" + image64 + "'></div></td></tr>"
    }
    function addTableSmeta(ceiling = false,noEmpty = false){
    if (ceiling){
        ceilingId = ceiling
    }
        $item = newClient.find(item => item.id === ceilingId)

        if (noEmpty == false){
            $('.table-bordered').empty();
        }

        $table = "";
        $table += "<thead class='thead rooms'><tr><td class='tdroom' colspan='5' style='font-size: 16px;font-weight: bold;'>Помещение: " + rooms.find(item => item.id === newClient.find(item => item.id === ceilingId)['room_id'])['name'] + "</td></tr></thead>";

        if (noEmpty ){
            $table += addImagesBlock($item)
        }

        $table += "<tbody class='tbody'><tr><td colspan='5' style='font-size: 16px;font-weight: bold;'>Работы</td></tr><tr><th scope='col'>Наименование</th><th scope='col'>Кол-во</th><th scope='col'>Ед.</th><th scope='col'>Цена</th><th scope='col'>Сумма</th></tr>";

        $table += worksProductions($item);

        $table += worksSmeta($item);

        $table += materialSmeta($item);



            $table += itogSmeta($item);



        $('.table-bordered').append($table)

    }
    function calculateSmeta(){
        var totalWork = 0;
        var totalMaterial = 0;
        var total  = 0;
        $.each($('.total-work'),function(ind,val){

            totalWork = totalWork + ($(val).text()-0)
        })

        $.each($('.total-material'),function(ind,val){
            totalMaterial = totalMaterial + ($(val).text()-0)
        })
        total = (totalWork+totalMaterial).toFixed(2)
        $('.itogo-work').text(totalWork.toFixed(2))
        $('.itogo-mateial').text(totalMaterial.toFixed(2))
        $('.itog-vsego').text(total)


    }
    function getval(id){
        $item = newClient.find(item => item.id === ceilingId).smeta;

        if ($item.find(item=>item.id == id) != undefined){
            return $item.find(item=>item.id == id).quantiny
        }
        return ''
    }
    function listGroop(status) {

        if(!status)status = 0
        str = ''
        $subNavShow = []

                for (let i = 0; i < groops.length; i++) {
                    if (groops[i].id != 4){
                        str += "<div  class='parent'><div class='par'>" + groops.find(it=>it.id == groops[i].id).name + "</div><div class='sub-nav sub-nav-show-" + groops[i].id + "'>"
                        $.each(types_of_work, function (ind, val) {

                            placeholder = ''
                            if (val.kinds == status) {
                                if (val.group_id == groops[i].id){
                                    if( val.communications_id != 0){

                                        placeholder = "placeholder='"+ $('#'+communications.find(com => com.id == val.communications_id).name).text() +"'"
                                    }

                                    if (getval(val.id) != '' && $subNavShow.find(sub => sub.num == groops[i].id) == undefined){
                                        $subNavShow.push({num:i})
                                    }

                                    getVal = getval(val.id);
                                    str += "<div class='wid-6 fz-20'><div class='name w-75'>" + val.name + "</div><div class='val w-10'><input class='inputid' " + placeholder + " id='id-" + val.id + "' data_multiple='" + val.multiple + "' value='" + getVal + "' style='width: 85px' type='number'></div></div>"
                                }
                            }
                        })
                        str += "</div></div>"
                    }


                }
        $('#navs').empty().append(str)
        $('.sub-nav').hide()

        $.each($subNavShow,function(ind,val){
            $('.sub-nav-show-'+val.num).show()

        })


    }
    function listGroopRedactor(status) {

        if(!status)status = 0
        str = ''
        $subNavShow = []
        selectRoomRedactor = '';
        units = '';
        for (let i = 0; i < groops.length; i++) {

                str += "<div  class='parent'><div class='par'>" + groops.find(it=>it.id == groops[i].id).name + "</div><div class='sub-nav sub-nav-show-" + groops[i].id + "'>"
                $.each(types_of_work, function (ind, val) {


                    if (val.kinds == status) {
                        if (val.group_id == groops[i].id){
                            $.each(groops,function(ind,vals){
                                if (val.group_id == vals.id){
                                    selectRoomRedactor += "<option  selected value='" + vals.id + "'>  " + vals.name + "</option>"
                                }else{
                                    selectRoomRedactor += "<option  value='" + vals.id + "'>  " + vals.name + "</option>"
                                }
                            })
                            $.each(unit,function(ind,vals){
                                if (val.id_unit_of_measurement == vals.id){

                                    units += "<option  selected value='" + vals.id + "'>  " + vals.name + "</option>"
                                }else{

                                    units += "<option  value='" + vals.id + "'>  " + vals.name + "</option>"
                                }

                            })
                            str += "<div class='rows'><div class='col-lg-12'><input type='text' name='name-title' value='" + val.name + "'></div>"

                            str += "<div class='flex-rows'>"

                            str += "<label for=''>Группа:<select name='groops' class='form-control selectRoomRedactor'>"+selectRoomRedactor+"</select></label>"
                            str += "<label for=''>Ед.измер:<select name='unit' class='form-control unit'>"+units+"</select></label>"
                            str += "<label for=''>Кратность:<input type='number' id='' name='multiple' value='"+ val.multiple +"'></label>"
                            str += "<label for=''>Цена клиент:<input type='number' id='' name='price-client' value='"+ val.price +"'></label>"
                            str += "<label for=''>Цена монтаж:<input type='number' id='' name='price-montaj' value='"+ val.price_montaj +"'></label></div>"
                            str += "</div>"
                        }
                    }
                    selectRoomRedactor = '';
                    units = '';
                })
                str += "</div></div>"



        }
        $('#navsRedactor').empty().append(str)
        $('.sub-nav').hide()





    }

    function calculateSmetaAll(){
        smetaAll = $('.table-bordered .tbody')
        $it = 0
        $.each(smetaAll,function(index,value){
            $itWork = 0
            $itMaterioal = 0

            calculate = $(value).children('.calculate')
            $.each(calculate,function(ind,val){
               // console.log($(val).children('.total-work').text())
                dataInfo  = $(val).attr('data-info').split('-')

                if (types_of_work.find(t=>t.id == dataInfo[3]).kinds == 2 || types_of_work.find(t=>t.id == dataInfo[3]).kinds == 0){
                    $itWork = $itWork+($(val).children('.total-work').text()-0)
                }
                if (types_of_work.find(t=>t.id == dataInfo[3]).kinds == 1 ){
                    $itMaterioal = $itMaterioal+($(val).children('.total-material').text()-0)
                }


            })
            $(value).children('tr').children('.itogo-work').text($itWork.toFixed(2))
            $(value).children('tr').children('.itogo-mateial').text($itMaterioal.toFixed(2))
            $(value).children('tr').children('.itog-vsego').text(($itWork+$itMaterioal).toFixed(2))
            $it = $it+$itWork+$itMaterioal;

            console.log('dataInfo')

        })
        $('.table-bordered').append("<tbody class='tbody'><tr><td style='text-align: right;font-weight: bold;padding: 5px 10px;font-size: 12px;' colspan='4'>Итого всего :</td><td style='font-weight: bold;font-size: 12px;' class='itogo'>"+($it).toFixed(2)+"</td></tr></tbody>")
    }
    function exitInSmetaAll(){
        $('.selectRoomBlock').hide()


            addHeadSmeta();
            $('.table-bordered').empty();
            $.each(newClient,function(ind,val){

                addTableSmeta(val.id,true);
            })

            calculateSmetaAll();




    }
    function exitInSmeta($id = false){
    $('.selectRoomBlock').show()
        selectRoom($id);
if (newClient.find(item => item.id === ceilingId) != undefined){

    addHeadSmeta();
    specificationSmeta();
    addTableSmeta();
    calculateSmeta();
    listGroop();

}else{
    navShow('main-2')
    //clearElems();
    new Noty({
        theme: 'relax',
        timeout: 2000,
        layout: 'topCenter',
        type: "warning",
        text: "Нет чертежей "
    }).show();
    new Noty({
        theme: 'relax',
        timeout: 2000,
        layout: 'topCenter',
        type: "success",
        text: "Создайте чертеж"
    }).show();


}


    }
    function setPropertyMultiple(num,multiple){
        return Math.ceil(num/multiple)*multiple;
    }
    function changeInput(id){
        $item = newClient.find(item => item.id === ceilingId)

        valuesInput = $('#id-'+id).val()
        if (valuesInput == ''){
            if ($item.smeta.find(sm=>sm.id == id) != undefined){
                $item.smeta = $item.smeta.filter(function(number) {
                    if (number.id != id){
                        return number;
                    }

                });

            }
        }else{
            if ($item.smeta.find(sm=>sm.id == id) == undefined){
                $item.smeta.push({
                    "id": id,
                    "quantiny": valuesInput,
                    "price": types_of_work.find(t=>t.id == id).price,
                    "price_montaj": types_of_work.find(t=>t.id == id).price_montage,
                    "edit_price": "false"
                })
            }else{
                $item.smeta.find(sm=>sm.id == id).quantiny = valuesInput
            }
        }

        newClient.find(item => item.id === ceilingId).updateSmeta = true
        saveStorage()

    }
    $(document).on('click','#btn_popup_input_new',function (){
        $item = newClient.find(item => item.id === ceilingId).smeta
        $values = $('#popup_input_new_hidden').val().split('-')
        $ID = $values[3]
        msg = false
        if ($className == 'multiplied'){
            $item.find(sem=>sem.id == $ID).edit_price = $('#popup_input_new_val').val();
        }

        if ($className == 'multiplier'){

            if (types_of_work.find(t=>t.id == $ID).kinds != '2' ){
                $item.find(sem=>sem.id == $ID).quantiny = $('#popup_input_new_val').val();
            }else{
                msg = true
                new Noty({
                    theme: 'relax',
                    timeout: 2000,
                    layout: 'topCenter',
                    type: "warning",
                    text: "Нельзя изменить"
                }).show();
            }

        }
        $('#popup_input_new').hide()

        if (!msg){
            newClient.find(item => item.id === ceilingId).updateSmeta = true
            saveStorage()
            new Noty({
                theme: 'relax',
                timeout: 2000,
                layout: 'topCenter',
                type: "success",
                text: "Измененно"
            }).show();
        }



        exitInSmeta(ceilingId)
        return false

    })

    $(document).on('change','#priceCheckChecked',function (){
        if ($('#priceCheckChecked').is(':checked')){
            $('.price-client').hide()
            $('.price-montaj').hide()
            $('.price-materiall').show()
            $('.formFileMultiple').show()
        } else {
            $('.price-client').show()
            $('.price-montaj').show()
            $('.price-materiall').hide()
            $('.formFileMultiple').hide()
        }
    })
    $(document).on('click','#btn-new-price',function (){
        submitNewPrice()
    })

    function submitNewPrice(){

        if ($('#name').val() == ''){
            new Noty({
                theme: 'relax',
                timeout: 2000,
                layout: 'topCenter',
                type: "warning",
                text: "Не заполнено Наименование"
            }).show();return false
        }
        var formData = new FormData();
        if ($('#priceCheckChecked').is(':checked')){
            if ($('#price-materiall').val() == ''){
                new Noty({
                    theme: 'relax',
                    timeout: 2000,
                    layout: 'topCenter',
                    type: "warning",
                    text: "Не заполнено стоимость материала"
                }).show();return false
            }
                formData.append('priceMontaj', 0);
                formData.append('priceClient', 0);
                formData.append('material', $('#price-materiall').val());
                formData.append('file', $("#formFileMultiple")[0].files[0]);
                formData.append('kinds', 1);
        } else {
            formData.append('material', 0);
            formData.append('file', 0);
            if ($('#price-client').val() == ''){
                new Noty({
                    theme: 'relax',
                    timeout: 2000,
                    layout: 'topCenter',
                    type: "warning",
                    text: "Не заполнено стоимость для клиента"
                }).show();return false
            }
            if ($('#price-montaj').val() == ''){
                new Noty({
                    theme: 'relax',
                    timeout: 2000,
                    layout: 'topCenter',
                    type: "warning",
                    text: "Не заполнено стоимость за монтаж"
                }).show();return false
            }

            formData.append('priceMontaj', $('.formGroops #price-montaj').val());
            formData.append('priceClient', $('.formGroops #price-client').val());
            formData.append('kinds', 0);
        }

        formData.append('types_of_work', JSON.stringify(types_of_work));
        formData.append('communications', $('.formGroops #communications').val());
        formData.append('groops', $('.formGroops #groops').val());
        formData.append('success', 'getFormData');

        formData.append('name', $('.formGroops #name').val());
        formData.append('unit', $('.formGroops #unit').val());
        formData.append('multiple', $('.formGroops #price-multiple').val());
        $.ajax({
            type: "POST",
            url: '/',
            cache: false,
            contentType: false,
            processData: false,
            data: formData,
            dataType : 'json',
            success: function(data){

                new Noty({
                    theme: 'relax',
                    timeout: 2000,
                    layout: 'topCenter',
                    type: "success",
                    text: data.error
                }).show();
                if(data.types_of_work != undefined)types_of_work = data.types_of_work

                listGroop()
            },error: function(data) {
                console.log(data)
            }
        });

   return false
    }
    $(document).on('click','#btn_categories',function (){
        submitCategories()
    })
    function submitCategories(){
       nameGroops = $('#addCategories').val();
       if (nameGroops == ''){
           new Noty({
               theme: 'relax',
               timeout: 2000,
               layout: 'topCenter',
               type: "warning",
               text: "Не заполнено категория"
           }).show();return false
       }
       if (groops.find(gr=>gr.name == nameGroops)){
           new Noty({
               theme: 'relax',
               timeout: 2000,
               layout: 'topCenter',
               type: "warning",
               text: "Есть такая категория"
           }).show();return false
       }
       $result = getAjax({nameGroops:nameGroops,success:'nameGroops'})
        if ($result.groups != undefined)groops = $result.groups

        noty('success',$result.noty)


        groopsCategories(nameGroops)
        listGroop()
    }
    $(document).on('click','#btn_categories_delete',function (){
        btnCategoriesDelete()
    })

    function btnCategoriesDelete(){
        alert('btnCategoriesDelete()')
    }
    $(document).on('click','.multiplied,.multiplier',function (){
        if(ceilingAll)return false
        $className = this.className;
        if ($className == 'multiplier' && noChange === false){
            new Noty({
                theme: 'relax',
                timeout: 2000,
                layout: 'topCenter',
                type: "warning",
                text: "Нельзя изменить"
            }).show();
            return false;
        }
        alignCenter($('#popup_input_new'))
        $('#popup_input_new').show()
        $('#popup_input_new_val').show()


        $obj = $(this)
        $valInput = $obj.text()-0

        $('#popup_input_new_val').val($valInput).select()
        $('#popup_input_new_hidden').val($obj.parent().attr('data-info'))

    })

    $(document).on('click','.inputid',function (){

        if ($(this).attr('placeholder') != undefined){

            place_holder = $(this).attr('placeholder')

            $(this).val(place_holder)
            $(this).removeAttr('placeholder')
            $(this).trigger('change').select();

        }
    },)

    $(document).on('change','.inputid',function(e) {
        inputVal = $(this).val()
        if ($(this).val() <= 0){
            inputVal =  $(this).val('')

        }
        curentInputId = $(this).attr('id').replace('id-', '')
        curentMultiple = $(this).attr('data_multiple')
        console.log($(this).val())
        $(this).val(setPropertyMultiple(inputVal,curentMultiple))
        console.log($(this).val())
        changeInput(curentInputId,curentMultiple);
        addTableSmeta();
        calculateSmeta();

    });

    $(document).on("click", "#form-smeta-client", function (e) {
        saveStorage()
        getStorageReturn()
        ceilingOne = false
        ceilingAll = true

        exitInSmetaAll()
        formSmetaHTML = $('.contener-smeta').html()
        getAjax({contentHTML:formSmetaHTML,success:'formSmetaHTML',number_order:$('#number_order a').text()})


        $('#resultHREF').empty().append("<div class='container' style='margin-top: 20px;'><a target='_blank' href='" + resultAjax.url + "' class='btn btn-primary btn-lg ' role='button'>"+resultAjax.url+"</a></div>")

    })
    $(document).on("click", ".par", function (e) {
        e.preventDefault();
        if ($(this).hasClass('open')) {
            $(this).removeClass('open').next().slideUp();
        } else {
            $(this).addClass('open').next().slideDown();
        }
    });

    function eachTexturesData($elem){
        $.each(texturesData,function(ind,val){
            if ($elem == '#select_manufacturer'){

                select_facture_id = $('#select_facture').val()
                if (val.texture.id == select_facture_id){
                    $($elem).empty()
                    $.each(val.manufacturers,function(index,value){

                        $($elem).append("<option value='" + value.id + "'>" + value.name + "</option>")
                    })
                }

            }
            if ($elem == '#select_facture'){
                $($elem).append("<option value='" + val.texture.id + "'>" + val.texture.title + "</option>")
            }
        })
    }
    function addTexture_manufacture(){
        eachTexturesData('#select_facture')
        eachTexturesData('#select_manufacturer')
    }


    var manufacturera = <?=$this->route['manufacturera']?>,
        groops = <?=$this->route['groops']?>,
        types_of_work = <?=$this->route['types_of_work']?>,
        unit = <?=$this->route['unit']?>,
        communications = <?=$this->route['communications']?>,
        texture = <?=$this->route['texture']?>,
        rooms = <?=$this->route['rooms']?>,
        user_id = <?=$this->client?>,
        userClient = <?=$this->route['client']?>,
        days = '<?=$this->days?>',

        user = <?=$this->route['user']?>,

        kinds = <?=$this->route['kinds']?>,
        showNoty = true,
        $error = false,
        client = [],
        deliteCeilingName,
        clientId,
        $draw = 0,
        ceilingId,
        image64,
        $mainShow = 'main-2',
        clientAdressId,
        editUserClient = [],
        newClient = [],
        boolClientAdress = 0,
        resultAjax,
        ceilingOne = true,
        ceilingAll = false,
        smataClient = true,
        smataMontaj = false,
        smataMaterial = false,
        smataMaterials = false,
        smataWorks = true,
        noChange = false,
        btn_client = false,
        updateCeiling = false,
        $className,
        setClient = <?=$this->route['setClient'];?>,
        userClientAdress = <?=$this->route['clientAdress']?>,
        UserClientAdress = userClientAdress,
        texturesmanafacture = <?=$this->route['base']?>,
        texturesData = JSON.parse('[{"texture":{"id":"1","title":"Мат"},"manufacturers":[{"id":"4","name":"MSD Classic(белые)"},{"id":"3","name":"MSD Premium(белые)"},{"id":"2","name":"MSD(цветные)"},{"id":"10","name":"MSD Evolution"},{"id":"1","name":"Longwei"},{"id":"11","name":"Teqtum"},{"id":"13","name":"Cold Stretch"},{"id":"12","name":"LumFer"},{"id":"14","name":"Folien"}]},{"texture":{"id":"2","title":"Сатин"},"manufacturers":[{"id":"4","name":"MSD Classic(белые)"},{"id":"3","name":"MSD Premium(белые)"},{"id":"2","name":"MSD(цветные)"},{"id":"10","name":"MSD Evolution"},{"id":"1","name":"Longwei"},{"id":"12","name":"LumFer"},{"id":"14","name":"Folien"}]},{"texture":{"id":"3","title":"Глянец"},"manufacturers":[{"id":"4","name":"MSD Classic(белые)"},{"id":"3","name":"MSD Premium(белые)"},{"id":"2","name":"MSD(цветные)"},{"id":"10","name":"MSD Evolution"},{"id":"1","name":"Longwei"},{"id":"12","name":"LumFer"}]},{"texture":{"id":"6","title":"Искры"},"manufacturers":[{"id":"2","name":"MSD(цветные)"}]},{"texture":{"id":"9","title":"Перламутр"},"manufacturers":[{"id":"2","name":"MSD(цветные)"}]},{"texture":{"id":"10","title":"Металлик"},"manufacturers":[{"id":"2","name":"MSD(цветные)"}]},{"texture":{"id":"15","title":"Мечта"},"manufacturers":[{"id":"2","name":"MSD(цветные)"}]},{"texture":{"id":"16","title":"Фантазия, Парча"},"manufacturers":[{"id":"2","name":"MSD(цветные)"}]},{"texture":{"id":"20","title":"Хамелеон глянец"},"manufacturers":[{"id":"5","name":"Alkor Draka"}]},{"texture":{"id":"21","title":"Фактура"},"manufacturers":[{"id":"2","name":"MSD(цветные)"}]},{"texture":{"id":"22","title":"Иллюзия"},"manufacturers":[{"id":"2","name":"MSD(цветные)"}]},{"texture":{"id":"23","title":"Вдохновение, Весна, Кожа белые"},"manufacturers":[{"id":"2","name":"MSD(цветные)"}]},{"texture":{"id":"25","title":"Ткань"},"manufacturers":[{"id":"7","name":"Deskor"}]},{"texture":{"id":"27","title":"Штукатурка"},"manufacturers":[{"id":"2","name":"MSD(цветные)"}]},{"texture":{"id":"28","title":"Небо на глянце"},"manufacturers":[{"id":"2","name":"MSD(цветные)"}]},{"texture":{"id":"29","title":"Кружочки"},"manufacturers":[{"id":"2","name":"MSD(цветные)"}]},{"texture":{"id":"30","title":"Шанжан (Фантазия)"},"manufacturers":[{"id":"2","name":"MSD(цветные)"}]},{"texture":{"id":"31","title":"Бабочки"},"manufacturers":[{"id":"2","name":"MSD(цветные)"}]},{"texture":{"id":"32","title":"Листочки"},"manufacturers":[{"id":"2","name":"MSD(цветные)"}]},{"texture":{"id":"33","title":"Velur"},"manufacturers":[{"id":"2","name":"MSD(цветные)"}]},{"texture":{"id":"35","title":"Весна"},"manufacturers":[{"id":"2","name":"MSD(цветные)"}]}]')





</script>