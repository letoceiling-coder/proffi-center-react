function groopsCategories(nameGroops = false){
    const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);
    if (nameGroops){
        nameGroops = capitalize(nameGroops)
        $('#addCategories').val(nameGroops)
    }
    $('#groops').empty()
    $.each(groops,function(ind,val){
        if (nameGroops == val.name){
            $('#groops').append("<option  selected value='" + val.id + "'>  " + val.name + "</option>")
        }else{
            $('#groops').append("<option  value='" + val.id + "'>  " + val.name + "</option>")
        }

    })

}
function noty(type,text){
    new Noty({
        theme: 'relax',
        timeout: 2000,
        layout: 'topCenter',
        type: type,
        text: text
    }).show();
}
$(document).ready(function (){



    function getUnit(){
        $.each(unit,function(ind,val){
            $('#unit').append("<option  value='" + val.id + "'>  " + val.name + "</option>")
        })
    }
    function getKinds(){
        $.each(kinds,function(ind,val){
            $('#kinds').append("<option  value='" + val.id + "'>  " + val.name + "</option>")
        })
    }
    function getCommunications(){
        $('#communications').append("<option  value='0'>Default</option>")
        $.each(communications,function(ind,val){

            $('#communications').append("<option  value='" + val.id + "'>  " + val.placeholder + "</option>")
        })
    }

    groopsCategories()
    getUnit()
    getKinds()
    getCommunications()
    navShow($mainShow)



    borderBlue(' [data-includes="'+$mainShow+'"]');

    $('.header-block .icons').on('click',function (){
        includes = $(this).attr('data-includes')

        if (includes == 'main-2'){
            clearElems();
        }
        if (includes == 'main-1'|| includes == 'main-3' || includes == 'main-4'|| includes == 'main-5'){
            $('#ceiling-one').trigger('click')
        }
        if ( includes == 'main-6'){
            listGroopRedactor()
        }



        navShow(includes,this)
        return false
    })
    $('.btn-block-ceiling button').on('click',function (){
        $('.btn-block-ceiling button').addClass('btn-info')
        $(this).removeClass('btn-info').addClass('btn-success')
    })
    $('.btn-block-client button').on('click',function (){
        $('.btn-block-client button').addClass('btn-info')
        $(this).removeClass('btn-info').addClass('btn-success')
    })
})