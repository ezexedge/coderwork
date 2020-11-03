import axios from 'axios'
import Swal from 'sweetalert2'
document.addEventListener('DOMContentLoaded' , () =>{
    const skills = document.querySelector('.lista-conocimientos')
//limpiar alertas contenedor padre alertas

let alertas = document.querySelector('.alertas')
if(alertas){
        limpiarAlertas()
}

    if(skills){
        skills.addEventListener('click', agregarSkills)
        skillsSeleccionados()
    }

    const vacanteListado = document.querySelector('.panel-administracion')

    if(vacanteListado){
        vacanteListado.addEventListener('click',accionesListado)
    }

  
})
const skills = new Set()

const agregarSkills = (e) => {
    if(e.target.tagName === 'LI'){
        if(e.target.classList.contains('activo')){
            skills.delete(e.target.textContent)
            e.target.classList.remove('activo')
        }else{
            skills.add(e.target.textContent)
            e.target.classList.add('activo')
        }
  
    }

    const skillsArray = [...skills]
    document.querySelector('#skills').value = skillsArray



}


const skillsSeleccionados = () => {
    const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo'))
    seleccionadas.forEach(seleccionada => {
        skills.add(seleccionada.textContent)
    })

    const skillsArray = [...skills]
    document.querySelector('#skills').value = skillsArray



    console.log(seleccionadas)
}

const limpiarAlertas = () => {
    //alertes.childres son los hijos de alertas que se introduce
    const alertas = document.querySelector('.alertas')
    const interval = setInterval(()=> {
        if(alertas.children.length > 0){
            alertas.removeChild(alertas.children[0])
            //pongo cero 0 por que borra uno tras uno borra uno y sigue otro
        }else if(alertas.children.length === 0){
            alertas.parentElement.removeChild(alertas)
            //cuando llega a cero ingreso y paro que deje de borrar con el clearinterval
            clearInterval(interval)
        }
    },2000)
  

}


const accionesListado = e => {
    e.preventDefault()
    if(e.target.dataset.eliminar){
        //usamos axios

Swal.fire({
  title: 'Are you sure?',
  text: "You won't be able to revert this!",
  type: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Yes, delete it!'
}).then((result) => {
  if (result.value) {
//aca vamos a la url de donde estamos parados
    const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}` 
    
    axios.delete(url, {params : url})
        .then(function(respuesta){
            if(respuesta.status === 200){

                Swal.fire(
                    'Deleted!',
                    respuesta.data,
                    'success'
                  )

                  //lo borro del dom
                  e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement)

            }
        })

        .catch(() => {
            Swal.fire({
                type:'error',
                title: 'Hubo un error',
                text: 'No Se pudo eliminar'
            })
        })
  }
})

    }
    else if(e.target.tagName === 'A') {
        window.location.href = e.target.href;
    }
}