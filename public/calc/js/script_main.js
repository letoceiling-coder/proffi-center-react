$(document).ready(function (){
    getRooms()
    if (localStorage.getItem('newClient') != null){
        getStorageReturn()
    }
    $('#smata-works').on('click',function (){
        smataMaterials = false
        smataWorks = true
        listGroop()
    })
    $('#smata-materials').on('click',function (){
        smataMaterials = true
        smataWorks = false
        listGroop(1)
    })
    $('#ceiling-one').on('click',function (){
        ceilingOne = true
        ceilingAll = false
        exitInSmeta(ceilingId)
    })
    $('#ceiling-all').on('click',function (){
        ceilingOne = false
        ceilingAll = true
        exitInSmetaAll()
    })
    $('#smata-client').on('click',function (){
        smataClient = true
        smataMontaj = false
        smataMaterial = false
        exitInSmeta(ceilingId)
    })
    $('#smata-montaj').on('click',function (){
        smataClient = false
        smataMontaj = true
        smataMaterial = false
        exitInSmeta(ceilingId)
    })
    $('#smata-material').on('click',function (){
        smataClient = false
        smataMontaj = false
        smataMaterial = true
        exitInSmeta(ceilingId)
    })
    $("#client_phone").inputmask("+7 (999) 999-99-99");



    $('#btn_client').on('click',function (){
        btn_client = true
        $error = false


        clearElems();
        client = $('#client').val()
        client_phone = $('#client_phone').val()
        client_adress = $('#client_adress').val()
        room_id = $('#select_client').val()
        room_name = $('#select_client option:selected').text();
        if (!client) {
            noty('warning',"Заполните Имя")
            $error = true
        }
        if(!client_phone){
             noty('warning',"Заполните телефон")
            $error = true
        }else if (client_phone.indexOf('_') != -1){
            noty('warning',"Номер телефона заполнен не полностью")
            $error = true
        }


        if(!client_adress){
            noty('warning',"Заполните адрес")
            $error = true
        }
        if ($error)return false;

        if(userClient === false){
            userClient = []
            maxClient = 1

            userClient.push({
                id:maxClient,
                user_id:user_id,
                name:client,
                phone:client_phone
            })
            max = 1

            userClientAdress.push({
                id:max,
                user_id:user_id,
                client_id:maxClient,
                adress:client_adress
            })
            newClient.push({
                room_id:room_id,
                client_id:maxClient,
                id_user:user_id,
                name:client,
                phone:client_phone,
                adress:client_adress,
                adress_id:max,
                newCeiling:true,
                newClient:true,
                newAdress:true})
            if(showNoty){
                noty('success',"Создан новый клиент")
                noty('success',"Добавлен новый адрес")
                noty('success',"Создан новый чертеж")

            }
        }else{
            if (id = userClient.find(item => item.name === client && item.phone === client_phone )){

                if(userClientAdress.find(item => item.client_id === id.id && item.adress === client_adress)){
                    console.log(id)
                    newClient.push({
                        room_id:room_id,
                        client_id:id.id,
                        id_user:user_id,
                        phone:id.phone,
                        name:id.name,
                        adress:client_adress,
                        adress_id:userClientAdress.find(f=>f.adress == client_adress).id,
                        newCeiling:true
                    })
                    if(showNoty){
                        noty('success',"Создан новый чертеж")
                    }
                }else{
                    max = userClientAdress.reduce(function(prev, current) {
                        if (+current.id > +prev.id) {
                            return current;
                        } else {
                            return prev;
                        }
                    });

                    userClientAdress.push({
                        id:(max.id-0)+1,
                        user_id:user_id,
                        client_id:id.id,
                        adress:client_adress
                    })
                    newClient.push({
                        room_id:room_id,
                        client_id:id.id,
                        id_user:user_id,
                        adress:client_adress,
                        adress_id:(max.id-0)+1,
                        newCeiling:true,
                        newAdress:true

                    })
                    if(showNoty){
                        noty('success',"Создан новый чертеж")
                        noty('success',"Создан новый адрес клиента")
                    }
                }

            }else{
                max = userClient.reduce(function(prev, current) {
                    if (+current.id > +prev.id) {
                        return current;
                    } else {
                        return prev;
                    }
                });
                maxid = (max.id-0)+1
                userClient.push({
                    id:(max.id-0)+1,
                    user_id:user_id,
                    name:client,
                    phone:client_phone
                })
                max = userClientAdress.reduce(function(prev, current) {
                    if (+current.id > +prev.id) {
                        return current;
                    } else {
                        return prev;
                    }
                });

                userClientAdress.push({
                    id:(max.id-0)+1,
                    user_id:user_id,
                    client_id:maxid,
                    adress:client_adress
                })
                newClient.push({
                    room_id:room_id,
                    client_id:maxid,
                    id_user:user_id,
                    name:client,
                    phone:client_phone,
                    adress:client_adress,
                    adress_id:(max.id-0)+1,
                    newCeiling:true,
                    newClient:true,
                    newAdress:true})
                if(showNoty){
                    noty('success',"Создан новый клиент")
                    noty('success',"Добавлен новый адрес")
                    noty('success',"Создан новый чертеж")

                }


            }
        }

        console.log(newClient)
        $('#popup_client').hide()

    })
    ///
    $('#renameManufacture_id').on('click',function (){

    })
    $('#btn_select_client').on('click',function (){
        clientId = $('#get_select_client').val();

        if ($('#get_select_client option:selected').attr('data_adress') == undefined){
                clientAdressId = userClientAdress.find(item => item.client_id == clientId)['id'];
        }else{
            clientAdressId = $('#get_select_client option:selected').attr('data_adress');
        }



            if(userClientAdress.filter(item => item.client_id === clientId).length > 1 && boolClientAdress == 0){

                selectClient('adress', clientId)
                return false
            }else {
                getNewClient = getAjax({clientId: clientId, clientAdressId: clientAdressId,user_id:user_id, success: 'setClient'})


                    newClient = getNewClient


                $('#popup_client_select').hide()
                $('#client').val(userClient.find(item => item.id == clientId).name)
                $('#client_phone').val(userClient.find(item => item.id == clientId).phone)
                $('#client_adress').val(userClientAdress.find(item => item.id == clientAdressId).adress)

                $('#popup_client').show()

            }
        navShow('main-4')
        exitInSmeta()



    })
    ///
    $('#btn_cancel_select_client').on('click',function (){
        $('#popup_client_select').hide()
        $('#popup_client').show()
        boolClientAdress = 0
        clientId = 0
        clientAdressId = 0

    })
    ///
    $('#btn_select_client_adress').on('click',function (){

        if (getActive(this,'По адресу','По клиенту') == 0){
            selectClient('name')
        }else{
            selectClient('adress')
        }

    })
    ///
    $('#btn_client_select').on('click',function (){

        getStorageReturn();
        btn_client_select();
    })

    ///
    $(document).on('change','.selectRoom',function(e) {
        if ($(this).val() == 0){
            navShow('main-2')
            return false
        }
        ceilingId = $(this).val()
        exitInSmeta(ceilingId)
    });

    $('#files-admin').on('click',function (){
        $('.admin').hide()
        $('.files-admin').show()
    })
    $('#smeta-admin').on('click',function (){
        $('.admin').hide()
        $('.smeta-admin').show()
    })
    $('.deliteCeiling').on('click',function (){
        preparationDeliteCeiling();
    })
    $('#btn_rename-popup_input').on('click',function (){
        deliteCeiling();
        $('#popup_input').hide();
    })
    $('#btn_cancel_popup_input').on('click',function (){
        $('#popup_input').hide();
    })
    $('.renameCeiling').on('click',function (){
        preparationRenameCeiling();
    })


    $(document).on('click','#container_colors button',function (){
if (!btn_client ){

    $('#img_hidden').trigger('change')
}



    })
    $(document).on('click','.renameManufacture_id',function (){
        $('#popup_canvas').show()
        updateCeiling = true

         $('#img_hidden').val(newClient.find(item => item.id === ceilingId).drawing_data);

        addTexture_manufacture()
    })
    $(document).on('change','#select_facture',function (){

        eachTexturesData('#select_manufacturer')
    })

    $('#btn_rename-selectRoom').on('click',function (){
        renameCeiling();
    })
    $('#btn_cancel_rename-selectRoom').on('click',function (){
        $('#popup_selectRoom').hide()
    })
    $('#btn_cancel_popup_input_new').on('click',function (){
        $('#popup_input_new').hide()
        return false
    })


})