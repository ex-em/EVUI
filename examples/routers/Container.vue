<template>
<div style="height: 400px; widht:100%">
   <container
          layout='Hbox'
          :wraperStyles ='costomstyle'
          :width = "800"
          :height = "400"
   >
         <container
           layout='Vbox'
           :wraperStyles ='costomstyle2'
           :width = "100"
           :height = "100"
         >
                     <container
                       layout='Vbox'
                       :wraperStyles ='costomstyle3'
                       :width = "50"
                       :height = "50"
                       :flex = 0.2
                     >
                     </container>
                     <container
                       layout='Hbox'
                       :wraperStyles ='costomstyle4'
                       :width = "50"
                       :height = "50"
                       :flex = 0.8
                     >
                     </container>
                       <container
                         layout='Hbox'
                         :wraperStyles ='costomstyle5'
                         :width = "50"
                         :height = "50"
                         :flex = 0.4
                       >
                       </container>
         </container>

     <container
       layout='Vbox'
       :wraperStyles ='costomstyle2'
       :width = "100"
       :height = "100"
     >
         <container
           layout='Hbox'
           :wraperStyles ='costomstyle3'
           :width = "50"
           :height = "50"
         >
         </container>
         <container
           layout='Hbox'
           :wraperStyles ='costomstyle4'
           :width = "50"
           :height = "50"
         >
         </container>

    </container>

     <container
       layout='Hbox'
       :wraperStyles ='costomstyle2'
       :width = "100"
       :height = "100"
     >
       <container
         layout='Vbox'
         :wraperStyles ='costomstyle3'
         :width = "50"
         :height = "50"
       >
       </container>
       <container
         layout='Vbox'
         :wraperStyles ='costomstyle4'
         :width = "50"
         :height = "50"
       >
       </container>

     </container>

     <container
       layout='Vbox'
       :wraperStyles ='costomstyle2'
       :width = "100"
       :height = "100"
     >
       <container
         layout='Hbox'
         :wraperStyles ='costomstyle3'
         :width = "50"
         :height = "50"
       >
       </container>
       <container
         layout='Hbox'
     :wraperStyles ='costomstyle4'
     :width = "50"
     :height = "50"
     >
   </container>
  </container>



  <container
    layout='Hbox'
    :wraperStyles ='costomstyle2'
    :width = "300"
    :height = "100"
  >
      <container
        layout='Vbox'
        :wraperStyles ='costomstyle3'
        :width = "50"
        :height = "50"
        :flex = 0.3
      >
      </container>
      <container
        layout='Vbox'
        :wraperStyles ='costomstyle4'
        :width = "50"
        :height = "50"
        :flex = 0.8
      >
      </container>
    <container
      layout='Vbox'
      :wraperStyles ='costomstyle5'
      :width = "50"
      :height = "50"
      :flex = 0.5
    >
    </container>
  </container>


   </container>
</div>
</template>
<script>
  import  Container from '@/components/container';
  import TextBox from '@/components/TextBox';
//horizontal vertical
  export default {
    components: {
      Container,TextBox
    },
    data() {
      return {
        value1: 'hbox'
      }
    }
    ,
    methods: {
    },
    computed: {
      costomstyle() {
        return  { 'background-color' : '#FFCDD2'};
      },
      costomstyle1() {
        return  { 'background-color' : '#FFF59D'};
      },
      costomstyle2() {
        return  { 'background-color' : '#C5CAE9'};
      },
      costomstyle3() {
        return  { 'background-color' : '#EF6C00'};
      },
      costomstyle4() {
        return  { 'background-color' : '#A1887F'};
      },
      costomstyle5() {
        return  { 'background-color' : 'orange'};
      }
    },
  }
</script>
<style>


</style>

