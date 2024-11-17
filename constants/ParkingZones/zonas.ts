interface Zona {
    color: string;
    horario: string;
    dias: string[];
    horarioInicio: string;
    horarioFin: string;
    coordenadas: { latitude: number; longitude: number }[];
  } 
  
  const zonas: Zona[] = [
    {
    color: 'rgba(255, 165, 0, 0.3)', // Amarillo/Naranja
    horario: "Lunes a viernes de 7 a 20 hs",
    dias: ["lunes", "martes", "miércoles", "jueves", "viernes"],
    horarioInicio: "7:00",
    horarioFin: "20:00",
    coordenadas: [
        { latitude: -34.918163837412045, longitude: -57.949729669197225 },
        { latitude: -34.91729360765209, longitude: -57.94871719434552 },
        { latitude: -34.916404906826976, longitude: -57.94780293736643 },
        { latitude: -34.91679298721055, longitude: -57.94723388075214 },
        { latitude: -34.916865308210305, longitude: -57.947140735047256 },
        { latitude: -34.92049198761981, longitude: -57.94235473844725 },
        { latitude: -34.9202628236064, longitude: -57.942124490217495 },
        { latitude: -34.916668554242676, longitude: -57.946977494429845 },
        { latitude: -34.9158015061487, longitude: -57.946014229593786 },
        { latitude: -34.91529845572631, longitude: -57.94660635337593 },
        { latitude: -34.91450123814845, longitude: -57.94569650283002 },
        { latitude: -34.91493642102651, longitude: -57.94515377798301 },
        { latitude: -34.91477542578666, longitude: -57.944983283428684 },
        { latitude: -34.91437739777251, longitude: -57.94553857335167 },
        { latitude: -34.91359934966022, longitude: -57.94465636840499 },
        { latitude: -34.9139899618709, longitude: -57.94411883369075 },
        { latitude: -34.91385900071071, longitude: -57.943987263273854 },
        { latitude: -34.910486685091044, longitude: -57.948592772571885 },
        { latitude: -34.906687392258085, longitude: -57.94883940691953 },
        { latitude: -34.90670251366579, longitude: -57.9491729632214 },
        { latitude: -34.90987858839528, longitude: -57.949059124363544 },
        { latitude: -34.91062630505832, longitude: -57.954406884235595 },
        { latitude: -34.911102244431845, longitude: -57.95452476381594 },
        { latitude: -34.911330946429615, longitude: -57.95479641244752 },
        { latitude: -34.911421197693336, longitude: -57.955079775903286 },
        { latitude: -34.911415600751965, longitude: -57.955484677527124 },
        { latitude: -34.91959064953251, longitude: -57.954984455993014 },
        { latitude: -34.92135822489275, longitude: -57.956986603504774 },
        { latitude: -34.92147019663834, longitude: -57.95683100884119 },
        { latitude: -34.92115726249405, longitude: -57.95654172471204 },
        { latitude: -34.92146254134707, longitude: -57.95649657329513 },
        { latitude: -34.921807869183766, longitude: -57.955863308452706 },
        { latitude: -34.922570933384044, longitude: -57.954906532571485 },
        { latitude: -34.92291356479855, longitude: -57.954572172938484 },
        { latitude: -34.92301163626905, longitude: -57.954142233444855 },
        { latitude: -34.92309303186348, longitude: -57.95398105336402 },
        { latitude: -34.921490821281814, longitude: -57.95220366389715 },
        { latitude: -34.91686517088135, longitude: -57.94714081623683 },
        { latitude: -34.91679286684752, longitude: -57.94723395456414 },
        { latitude: -34.917708896374144, longitude: -57.94820872662805 },
        { latitude: -34.91856797272112, longitude: -57.94920342681753 },
        { latitude: -34.918163837412045, longitude: -57.949729669197225 },
    ],
    },
    {
      color: 'rgba(255, 0, 255, 0.3)', // Violeta/Rosa
      horario: "Lunes a viernes de 7 a 14 hs",
      dias: ["lunes", "martes", "miércoles", "jueves", "viernes"],
      horarioInicio: "7:00",
      horarioFin: "14:00",
      coordenadas: [
        { latitude: -34.917370790632965, longitude: -57.962482878432226 },
        { latitude: -34.91818046565397, longitude: -57.96150293546498 },
        { latitude: -34.91903506891444, longitude: -57.962381237350954 },
        { latitude: -34.92124654432575, longitude: -57.95939593413739 },
        { latitude: -34.920368525521845, longitude: -57.9584181142875 },
        { latitude: -34.92143019917384, longitude: -57.956993307238776 },
        { latitude: -34.91944854108787, longitude: -57.954772690745486 },
        { latitude: -34.91143064805844, longitude: -57.955341209595574 },
        { latitude: -34.911354359751435, longitude: -57.95567837221296 },
        { latitude: -34.911306673787244, longitude: -57.95577358672212 },
        { latitude: -34.91144441270781, longitude: -57.955974452788865 },
        { latitude: -34.91584480210354, longitude: -57.960826457576545 },
        { latitude: -34.91573451252228, longitude: -57.960987771696125 },
        { latitude: -34.91572819475316, longitude: -57.96208243719323 },
        { latitude: -34.91587364025339, longitude: -57.962199005283196 },
        { latitude: -34.91676149131975, longitude: -57.96216734435244 },
        { latitude: -34.916947329613805, longitude: -57.96195502909286 },
        { latitude: -34.917370790632965, longitude: -57.962482878432226 }
      ],
    },
    {
      color: 'rgba(135, 206, 250, 0.6)', // Celeste
      horario: "Lunes a sábados de 9 a 20 hs",
      dias: ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
      horarioInicio: "9:00",
      horarioFin: "20:00",
      coordenadas: [
        { latitude: -34.92905411123089, longitude: -57.944159736202465 },
        { latitude: -34.928232954703944, longitude: -57.94325824563445 },
        { latitude: -34.929013262223194, longitude: -57.94220559629985 },
        { latitude: -34.928851965755015, longitude: -57.94202446983985 },
        { latitude: -34.9280611907195, longitude: -57.943054263003106 },
        { latitude: -34.927195608500945, longitude: -57.942153333814446 },
        { latitude: -34.92132858705787, longitude: -57.95014275334022 },
        { latitude: -34.92132948127231, longitude: -57.95106045195564 },
        { latitude: -34.921793323214835, longitude: -57.951593901081985 },
        { latitude: -34.92141557648307, longitude: -57.952186523517156 },
        { latitude: -34.92149322402409, longitude: -57.95226350099763 },
        { latitude: -34.92188491134268, longitude: -57.9517515964002 },
        { latitude: -34.92276686200659, longitude: -57.95258543746563 },
        { latitude: -34.925967834433706, longitude: -57.948298627834575 },
        { latitude: -34.92590420787152, longitude: -57.94727802295098 },
        { latitude: -34.92605048259924, longitude: -57.947061464032316 },
        { latitude: -34.92692628965063, longitude: -57.94704220762817 },
        { latitude: -34.92905411123089, longitude: -57.944159736202465 }
      ],
    },    
    {
        color: 'rgba(0, 255, 0, 0.3)', 
        horario: "Sábados de 9 a 20 hs",
        dias: ["sábado"],
        horarioInicio: "9:00",
        horarioFin: "20:00",
        coordenadas: [
          
          { latitude: -34.916843721308915, longitude: -57.947268292565326 },
          { latitude: -34.920471213479935, longitude: -57.9424394954889 },
          { latitude: -34.92020349971639, longitude: -57.94213514391909 },
          { latitude: -34.91660315487128, longitude: -57.94702016607242 },
          { latitude: -34.916843721308915, longitude: -57.947268292565326 },
        ],
      },
      {
        color: 'rgba(0, 255, 0, 0.3)', // Verde
        horario: "Sábados de 9 a 20 hs",
        dias: ["sábado"],
        horarioInicio: "9:00",
        horarioFin: "20:00",
        coordenadas: [
          
          { latitude: -34.909949139575616, longitude: -57.94897135977557 },
          { latitude: -34.910658776684095, longitude: -57.95443279017658 },
          { latitude: -34.9115404410996, longitude: -57.95543359058772 },
          { latitude: -34.91961509884899, longitude: -57.95497063261402 },
          { latitude: -34.920155026467796, longitude: -57.95414616285855 },
          { latitude: -34.91250248616529, longitude: -57.94567749413811 },
          { latitude: -34.909949139575616, longitude: -57.94897135977557 },
        ],
      },
      {
        color: 'rgba(0, 255, 0, 0.3)', // Verde
        horario: "Sábados de 9 a 20 hs",
        dias: ["sábado"],
        horarioInicio: "9:00",
        horarioFin: "20:00",
        coordenadas: [
          
          { latitude: -34.906816589077785, longitude: -57.94909630931021 },
          { latitude: -34.91048769857261, longitude: -57.94888849333297 },
          { latitude: -34.91046682666385, longitude: -57.94868900541239 },
          { latitude: -34.90680084628735, longitude: -57.948887833485855 },
          { latitude: -34.906816589077785, longitude: -57.94909630931021 },
        ],
      },
      {
        color: 'rgba(0, 0, 0, 0.8)', // Negro
        horario: "Prohibido estacionar",
        dias: ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"],
        horarioInicio: "00:00",
        horarioFin: "23:59",
        coordenadas: [
          { latitude: -34.91128147412391, longitude: -57.954680614551236 },
          { latitude: -34.91689106398983, longitude: -57.947138334532156 },
          { latitude: -34.91672165504933, longitude: -57.946963616125174 },
          { latitude: -34.911131287486114, longitude: -57.954516437635945 },
          { latitude: -34.91128147412391, longitude: -57.954680614551236 },
        ],
      },
      {
        color: 'rgba(0, 0, 0, 0.8)', // Negro
        horario: "Prohibido estacionar",
        dias: ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"],
        horarioInicio: "00:00",
        horarioFin: "23:59",
        coordenadas: [
          { latitude: -34.91642766113773, longitude: -57.95006217882495 },
          { latitude: -34.91634767817939, longitude: -57.94997259336104 },
          { latitude: -34.91395801556493, longitude: -57.953165457989755 },
          { latitude: -34.91403634612192, longitude: -57.95325254459544 },
          { latitude: -34.91642766113773, longitude: -57.95006217882495 }
        ],
      }, 


      // testing zones

      
      {
        color: 'rgba(0, 255, 0, 0.3)',
        horario: "lunes a domingos",
        dias: ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"],
        horarioInicio: "0:00",
        horarioFin: "23:59",
        coordenadas: [
          { latitude: -34.84819518338275, longitude: -58.09219043455225 },
          { latitude: -34.84897545145058, longitude: -58.089216252899945 },
          { latitude: -34.846970975190764, longitude: -58.08836886036286 },
          { latitude: -34.84633007792297, longitude: -58.09130981093429 },
          { latitude: -34.84819518338275, longitude: -58.09219043455225 }
        ]
      },
      {
        color: "#FF0000", // Puedes cambiar este color a uno adecuado
        horario: "1:00 - 18:00", // Ejemplo de horario, ajusta según tu necesidad
        dias: ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"], // Días en los que está vigente
        horarioInicio: "01:00",
        horarioFin: "18:00",
        coordenadas: [
          { latitude: -34.896624492606705, longitude: -57.93751552154403 },
          { latitude: -34.89922025145114, longitude: -57.933886280956145 },
          { latitude: -34.897416257862325, longitude: -57.931307931583376 },
          { latitude: -34.89560220213429, longitude: -57.93491273283966 },
          { latitude: -34.896624492606705, longitude: -57.93751552154403 }
        ]
      },                                
  ];
  
  export default zonas;
  