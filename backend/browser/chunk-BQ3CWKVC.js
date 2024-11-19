import{a as $,b as G,c as Y,d as H,f as K,i as Q,n as X,o as Z,p as j,q as ie}from"./chunk-65FY5U2Z.js";import{a as J}from"./chunk-AAG3QVMH.js";import{a as z,b as N,c as W,d as q}from"./chunk-XSM6QQML.js";import{La as ee,Ma as te,V as T,W as V,X as A}from"./chunk-EUDFLDIN.js";import{m as U,n as R}from"./chunk-SRORKJFO.js";import"./chunk-EJJBCPAK.js";import{$c as O,Hb as t,Ib as i,Jb as P,Nb as h,Qb as f,Sb as g,Vc as D,Wc as B,Xc as L,ad as F,bc as C,cb as a,cc as n,db as u,dc as l,ec as w,fc as E,kc as M,mc as v,nc as I,oa as S,rc as y,tc as _,ub as p,xa as x,ya as b,yb as s}from"./chunk-65NVJTBR.js";var oe=(d,r)=>({"bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200":d,"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200":r}),k=d=>["/projects",d];function ae(d,r){d&1&&(t(0,"div",8),P(1,"mat-spinner",9),i())}function de(d,r){if(d&1&&(t(0,"div",20)(1,"div",21)(2,"h3",22),n(3),i(),t(4,"span",23),n(5),i()(),t(6,"div",24)(7,"p",25),n(8),i()(),t(9,"div",26)(10,"div",27)(11,"div",28)(12,"mat-icon",29),n(13,"access_time"),i(),t(14,"span"),n(15),y(16,"date"),i()(),t(17,"a",30),n(18,"View \u2192"),i()()()()),d&2){let e=r.$implicit,o=g(2);a(3),l(e.name),a(),s("ngClass",I(9,oe,e.createdBy._id===o.currentUserId,e.createdBy._id!==o.currentUserId)),a(),w(" ",e.createdBy._id===o.currentUserId?"Owner":"Member"," "),a(3),l(e.description),a(7),l(_(16,6,e.lastAccessedAt,"shortDate")),a(2),s("routerLink",v(12,k,e._id))}}function ce(d,r){if(d&1){let e=h();t(0,"div",20)(1,"div",21)(2,"h3",22),n(3),i(),t(4,"div",31)(5,"button",32)(6,"mat-icon"),n(7,"more_vert"),i()(),t(8,"mat-menu",null,0)(10,"button",33),f("click",function(){let c=x(e).$implicit,m=g(2);return b(m.editProject(c))}),t(11,"mat-icon"),n(12,"edit"),i(),t(13,"span"),n(14,"Edit"),i()(),t(15,"button",34),f("click",function(){let c=x(e).$implicit,m=g(2);return b(m.deleteProject(c))}),t(16,"mat-icon"),n(17,"delete"),i(),t(18,"span"),n(19,"Delete"),i()()()()(),t(20,"div",24)(21,"p",25),n(22),i()(),t(23,"div",26)(24,"div",27)(25,"div",35)(26,"div",28)(27,"mat-icon",29),n(28,"group"),i(),t(29,"span"),n(30),i()(),t(31,"div",28)(32,"mat-icon",29),n(33,"calendar_today"),i(),t(34,"span"),n(35),y(36,"date"),i()()(),t(37,"a",30),n(38,"View \u2192"),i()()()()}if(d&2){let e=r.$implicit,o=C(9);a(3),l(e.name),a(2),s("matMenuTriggerFor",o),a(17),l(e.description),a(8),l(e.members.length),a(5),l(_(36,6,e.createdAt,"shortDate")),a(2),s("routerLink",v(9,k,e._id))}}function se(d,r){if(d&1&&(t(0,"div",20)(1,"div",21)(2,"h3",22),n(3),i(),t(4,"span",36),n(5," Member "),i()(),t(6,"div",24)(7,"p",25),n(8),i()(),t(9,"div",26)(10,"div",27)(11,"div",35)(12,"div",28)(13,"mat-icon",29),n(14,"person"),i(),t(15,"span"),n(16),i()(),t(17,"div",28)(18,"mat-icon",29),n(19,"group"),i(),t(20,"span"),n(21),i()()(),t(22,"a",30),n(23,"View \u2192"),i()()()()),d&2){let e=r.$implicit;a(3),l(e.name),a(5),l(e.description),a(8),l(e.createdBy.username),a(5),l(e.members.length),a(),s("routerLink",v(5,k,e._id))}}function le(d,r){d&1&&(t(0,"p",37),n(1," You're not a member of any projects yet. "),i())}function me(d,r){if(d&1){let e=h();t(0,"div",10)(1,"div",11)(2,"h2",12),n(3,"Recently Viewed"),i(),t(4,"div",13),p(5,de,19,14,"div",14),i()(),t(6,"div",15)(7,"div",16)(8,"h2",17),n(9,"Your Projects"),i(),t(10,"button",18),f("click",function(){x(e);let c=g();return b(c.openCreateProjectDialog())}),t(11,"mat-icon"),n(12,"add"),i()()(),t(13,"div",13),p(14,ce,39,11,"div",14),i()(),t(15,"div",11)(16,"div",16)(17,"h2",17),n(18,"Projects You're In"),i()(),t(19,"div",13),p(20,se,24,7,"div",14),i(),p(21,le,2,0,"p",19),i()()}if(d&2){let e=g();a(5),s("ngForOf",e.recentProjects),a(9),s("ngForOf",e.createdProjects),a(6),s("ngForOf",e.memberProjects),a(),s("ngIf",e.memberProjects.length===0)}}var re=class d{constructor(r,e,o,c){this.dialog=r;this.projectService=e;this.authService=o;this.snackBar=c;this.currentUserId=this.authService.getCurrentUserId()||"",this.username=this.authService.getCurrentUsername()||"",this.setGreeting()}createdProjects=[];memberProjects=[];isLoading=!1;recentProjects=[];currentUserId="";greeting="";username="";ngOnInit(){this.loadUserProjects(),this.loadRecentProjects()}setGreeting(){let r=new Date().getHours();r<12?this.greeting="Good morning":r<18?this.greeting="Good afternoon":this.greeting="Good evening"}loadUserProjects(){let r=this.authService.getCurrentUserId();if(!r){console.error("No user ID found - redirecting to login");return}this.isLoading=!0,this.projectService.getUserProjects().subscribe({next:e=>{this.createdProjects=e.filter(o=>o.createdBy&&o.createdBy._id===r),this.memberProjects=e.filter(o=>o.createdBy&&o.createdBy._id!==r&&o.members?.some(c=>c._id===r)),this.isLoading=!1},error:e=>{console.error("Error loading user projects:",e),this.snackBar.open("Error loading projects","Close",{duration:3e3}),this.isLoading=!1}})}loadRecentProjects(){this.projectService.getRecentProjects().subscribe({next:r=>{this.recentProjects=r},error:r=>{console.error("Error loading recent projects:",r),this.snackBar.open("Error loading recent projects","Close",{duration:3e3})}})}openCreateProjectDialog(){this.dialog.open(X,{width:"400px"}).afterClosed().subscribe(e=>{e&&(this.isLoading=!0,this.projectService.createProject(e).subscribe({next:()=>{this.loadUserProjects(),this.snackBar.open("Project created successfully","Close",{duration:3e3})},error:o=>{console.error("Error creating project:",o),this.snackBar.open("Error creating project","Close",{duration:3e3}),this.isLoading=!1}}))})}openEditProjectDialog(r){let e=this.dialog.open(j,{width:"400px",data:{project:r}})}deleteProject(r){this.dialog.open(ie,{width:"300px",data:{title:"Confirm Delete",message:`Are you sure you want to delete the project "${r.name}"?`}}).afterClosed().subscribe(o=>{o&&(this.isLoading=!0,this.projectService.deleteProject(r._id).subscribe({next:()=>{this.loadUserProjects(),this.snackBar.open("Project deleted successfully","Close",{duration:3e3})},error:c=>{console.error("Error deleting project:",c),this.snackBar.open("Error deleting project","Close",{duration:3e3}),this.isLoading=!1}}))})}editProject(r){this.dialog.open(j,{width:"300px",data:{name:r.name,description:r.description}}).afterClosed().subscribe(o=>{o&&(this.isLoading=!0,this.projectService.updateProject(r._id,o).subscribe({next:c=>{let m=this.createdProjects.findIndex(ne=>ne._id===c._id);m!==-1&&(this.createdProjects[m]=c),this.loadUserProjects(),this.snackBar.open("Project updated successfully","Close",{duration:3e3})},error:c=>{console.error("Error updating project:",c),this.snackBar.open("Error updating project","Close",{duration:3e3}),this.isLoading=!1}}))})}static \u0275fac=function(e){return new(e||d)(u(Q),u(Z),u(J),u(ee))};static \u0275cmp=S({type:d,selectors:[["app-dashboard"]],standalone:!0,features:[M],decls:9,vars:4,consts:[["menu","matMenu"],[1,"min-h-screen","bg-gradient-to-br","from-gray-50","to-gray-100","dark:from-gray-900","dark:to-gray-800"],[1,"max-w-7xl","mx-auto","px-4","sm:px-6","lg:px-8","py-8"],[1,"mb-10"],[1,"text-4xl","font-bold","text-gray-900","dark:text-white","mb-2"],[1,"text-gray-600","dark:text-gray-400"],["class","flex justify-center items-center min-h-[400px]",4,"ngIf"],["class","space-y-10",4,"ngIf"],[1,"flex","justify-center","items-center","min-h-[400px]"],["diameter","40"],[1,"space-y-10"],[1,"bg-white","dark:bg-gray-800","rounded-2xl","shadow-sm","p-6","border","border-gray-100","dark:border-gray-700"],[1,"text-2xl","font-bold","text-gray-900","dark:text-white","mb-6"],[1,"grid","grid-cols-1","sm:grid-cols-2","lg:grid-cols-3","gap-6"],["class","group bg-gray-50 dark:bg-gray-700 rounded-xl p-5 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 flex flex-col h-full",4,"ngFor","ngForOf"],[1,"bg-white","dark:bg-gray-800","rounded-2xl","shadow-sm","p-6","border","border-gray-100","dark:border-gray-700","mt-6"],[1,"flex","justify-between","items-center","mb-6"],[1,"text-2xl","font-bold","text-gray-900","dark:text-white"],["mat-mini-fab","","color","primary",1,"bg-blue-600","hover:bg-blue-700","dark:bg-blue-500","dark:hover:bg-blue-600","shadow-md",3,"click"],["class","text-center text-gray-600 py-8",4,"ngIf"],[1,"group","bg-gray-50","dark:bg-gray-700","rounded-xl","p-5","hover:bg-gray-100","dark:hover:bg-gray-600","transition-all","duration-300","flex","flex-col","h-full"],[1,"flex","justify-between","items-start","mb-3"],[1,"text-lg","font-semibold","text-gray-900","dark:text-white","truncate"],[1,"px-3","py-1","rounded-full","text-xs","font-medium",3,"ngClass"],[1,"flex-grow"],[1,"text-gray-600","dark:text-gray-300","text-sm","mb-4","line-clamp-2"],[1,"mt-auto","pt-4"],[1,"flex","justify-between","items-center"],[1,"flex","items-center","text-gray-500","dark:text-gray-400","text-sm"],[1,"text-sm","mr-1"],[1,"text-blue-600","dark:text-blue-400","hover:text-blue-800","dark:hover:text-blue-300","font-medium","text-sm",3,"routerLink"],[1,"opacity-0","group-hover:opacity-100","transition-opacity"],["mat-icon-button","",1,"text-gray-500","hover:text-gray-700",3,"matMenuTriggerFor"],["mat-menu-item","",3,"click"],["mat-menu-item","",1,"text-red-600",3,"click"],[1,"flex","items-center","gap-4"],[1,"bg-green-100","dark:bg-green-900","text-green-800","dark:text-green-200","px-3","py-1","rounded-full","text-xs","font-medium"],[1,"text-center","text-gray-600","py-8"]],template:function(e,o){e&1&&(t(0,"div",1)(1,"div",2)(2,"div",3)(3,"h1",4),n(4),i(),t(5,"p",5),n(6,"Welcome back to your project dashboard"),i()(),p(7,ae,2,0,"div",6)(8,me,22,4,"div",7),i()()),e&2&&(a(4),E(" ",o.greeting,", ",o.username," "),a(3),s("ngIf",o.isLoading),a(),s("ngIf",!o.isLoading))},dependencies:[F,D,B,L,O,A,V,T,K,H,G,$,Y,N,z,U,R,te,q,W],styles:[".sidenav-container[_ngcontent-%COMP%]{height:100vh}.sidenav[_ngcontent-%COMP%]{width:250px}.content[_ngcontent-%COMP%]{padding:20px}[_nghost-%COMP%]{display:block;--tw-bg-opacity: 1;background-color:rgb(249 250 251 / var(--tw-bg-opacity));transition-property:color,background-color,border-color,text-decoration-color,fill,stroke;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.3s}[_nghost-%COMP%]:is(.dark *){--tw-bg-opacity: 1;background-color:rgb(17 24 39 / var(--tw-bg-opacity))}.mat-icon[_ngcontent-%COMP%]{font-size:18px;width:18px;height:18px;line-height:18px}  .mat-mdc-raised-button{border-radius:9999px;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.3s}  .mat-mdc-menu-panel{border-radius:.75rem;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.3s}  .mat-mdc-menu-panel:is(.dark *){--tw-bg-opacity: 1;background-color:rgb(31 41 55 / var(--tw-bg-opacity));--tw-text-opacity: 1;color:rgb(255 255 255 / var(--tw-text-opacity))}.group[_ngcontent-%COMP%]:hover   .opacity-0[_ngcontent-%COMP%]{opacity:1}  .mat-mdc-mini-fab{width:40px!important;height:40px!important;padding:0!important;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.3s}  .mat-mdc-mini-fab .mat-icon{font-size:20px;line-height:20px;width:20px;height:20px}  .dark .mat-mdc-menu-item{--tw-text-opacity: 1;color:rgb(229 231 235 / var(--tw-text-opacity))}  .dark .mat-mdc-menu-item:hover{--tw-bg-opacity: 1;background-color:rgb(55 65 81 / var(--tw-bg-opacity))}  .dark .mat-mdc-menu-item .mat-icon{--tw-text-opacity: 1;color:rgb(156 163 175 / var(--tw-text-opacity))}  .dark .mat-mdc-menu-item:hover .mat-icon{--tw-text-opacity: 1;color:rgb(229 231 235 / var(--tw-text-opacity))}"]})};export{re as DashboardComponent};