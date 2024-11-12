import{a as C}from"./chunk-LSASUGUC.js";import{Ba as z,Ca as B,Fa as L,Ia as E,Ka as P,La as D,pa as w,ra as _,wa as M,xa as I,za as k}from"./chunk-FZHPKERB.js";import{l as y,m as x,n as S}from"./chunk-7TL4XPSH.js";import"./chunk-EJJBCPAK.js";import{$c as v,Hb as e,Ib as i,Jb as l,Qb as h,cb as d,cc as o,db as s,gc as m,hc as g,ic as u,kc as b,oa as f}from"./chunk-CJYNM3Q3.js";var G=class c{constructor(t,r,n){this.authService=t;this.router=r;this.snackBar=n}username="";password="";googleInitialized=!1;ngOnInit(){this.googleInitialized||this.initializeGoogleSignIn()}ngOnDestroy(){this.googleInitialized&&typeof google<"u"&&(google.accounts.id.cancel(),this.googleInitialized=!1)}onSubmit(){this.authService.login(this.username,this.password).subscribe({next:()=>{this.snackBar.open("Login successful!","Close",{duration:3e3,horizontalPosition:"center",verticalPosition:"bottom",panelClass:["success-snackbar"]}),this.navigateToDashboard()},error:t=>{this.snackBar.open(t.message||"Login failed","Close",{duration:3e3,horizontalPosition:"center",verticalPosition:"bottom",panelClass:["error-snackbar"]})}})}initializeGoogleSignIn(){if(typeof google>"u"){setTimeout(()=>this.initializeGoogleSignIn(),100);return}try{google.accounts.id.initialize({client_id:w.googleClientId,callback:this.handleCredentialResponse.bind(this),auto_select:!1,cancel_on_tap_outside:!0,context:"signin",ux_mode:"popup"});let t=document.getElementById("googleBtn");t?(google.accounts.id.renderButton(t,{type:"standard",theme:"outline",size:"large",text:"signin_with",width:250,logo_alignment:"center"}),this.googleInitialized=!0):console.error("Google sign-in button element not found")}catch(t){console.error("Error initializing Google Sign-In:",t)}}handleCredentialResponse(t){t.credential&&this.authService.loginWithGoogle(t.credential).subscribe({next:()=>{this.snackBar.open("Successfully logged in with Google!","Close",{duration:3e3,horizontalPosition:"center",verticalPosition:"bottom",panelClass:["success-snackbar"]}),this.router.navigate(["/dashboard"])},error:r=>{this.snackBar.open(r.message||"Google login failed","Close",{duration:3e3,horizontalPosition:"center",verticalPosition:"bottom",panelClass:["error-snackbar"]})}})}navigateToDashboard(){this.router.navigate(["/dashboard"])}static \u0275fac=function(r){return new(r||c)(s(C),s(y),s(P))};static \u0275cmp=f({type:c,selectors:[["app-login"]],standalone:!0,features:[b],decls:34,vars:2,consts:[[1,"min-h-screen","flex","flex-col","items-center","justify-center","bg-gray-50","py-12","px-4","sm:px-6","lg:px-8"],[1,"max-w-md","w-full","space-y-8"],["src","https://res.cloudinary.com/db2tvcbza/image/upload/v1730869163/logo_sfhhhd.png","alt","logo","crossorigin","anonymous",1,"mx-auto","h-12","w-auto"],[1,"mt-6","text-center","text-3xl","font-extrabold","text-gray-900"],[1,"space-y-4","w-full",3,"ngSubmit"],[1,"flex","flex-col"],["for","username",1,"text-sm","font-medium","text-gray-600","mb-1"],["id","username","name","username","type","text","required","",1,"px-3","py-2","border","border-gray-300","rounded-md","focus:outline-none","focus:ring-1","focus:ring-blue-500","focus:border-blue-500",3,"ngModelChange","ngModel"],["for","password",1,"text-sm","font-medium","text-gray-600","mb-1"],["id","password","name","password","type","password","required","",1,"px-3","py-2","border","border-gray-300","rounded-md","focus:outline-none","focus:ring-1","focus:ring-blue-500","focus:border-blue-500",3,"ngModelChange","ngModel"],[1,"flex","justify-end"],["routerLink","/forgot-password",1,"text-sm","text-blue-600","hover:underline"],["type","submit",1,"w-full","bg-blue-600","text-white","py-2","px-4","rounded-md","hover:bg-blue-700","focus:outline-none","focus:ring-2","focus:ring-blue-500","focus:ring-offset-2"],[1,"mt-6"],[1,"relative"],[1,"absolute","inset-0","flex","items-center"],[1,"w-full","border-t","border-gray-300"],[1,"relative","flex","justify-center","text-sm"],[1,"px-2","bg-gray-50","text-gray-500"],[1,"mt-6","flex","justify-center"],["id","googleBtn"],[1,"mt-6","text-center"],[1,"text-sm","text-gray-600"],["href","/register",1,"font-medium","text-indigo-600","hover:text-indigo-500"]],template:function(r,n){r&1&&(e(0,"div",0)(1,"div",1)(2,"div"),l(3,"img",2),e(4,"h2",3),o(5," Log In "),i()(),e(6,"form",4),h("ngSubmit",function(){return n.onSubmit()}),e(7,"div",5)(8,"label",6),o(9,"Username"),i(),e(10,"input",7),u("ngModelChange",function(a){return g(n.username,a)||(n.username=a),a}),i()(),e(11,"div",5)(12,"label",8),o(13,"Password"),i(),e(14,"input",9),u("ngModelChange",function(a){return g(n.password,a)||(n.password=a),a}),i()(),e(15,"div",10)(16,"a",11),o(17," Forgot your password? "),i()(),e(18,"button",12),o(19," Log in \u2192 "),i()(),e(20,"div",13)(21,"div",14)(22,"div",15),l(23,"div",16),i(),e(24,"div",17)(25,"span",18),o(26," Or Sign in with "),i()()(),e(27,"div",19),l(28,"div",20),i()(),e(29,"div",21)(30,"p",22),o(31," Don't have account? "),e(32,"a",23),o(33," Sign up "),i()()()()()),r&2&&(d(10),m("ngModel",n.username),d(4),m("ngModel",n.password))},dependencies:[v,E,B,_,M,I,L,z,k,S,x,D]})};export{G as LoginComponent};
