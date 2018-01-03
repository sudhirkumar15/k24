if you give simply npm i gulp then it will install letest v available.
___________________________________
iff u wanna intall specific version then use npm.A version has some meanin to it
so if u wanna update the dependency from other then letest version
"dependency" : {
	"gulp": "^ 1.8.1" // here sine ^ means it will take alway 1.8.1 only even if u change 1.5.1
	// to make it effect u have to give ~ sine 
	"gulp": "~ 1.5.5" // now run npm rm gulp and  npm 
}

to update a pkg 
npm update, npm update --dev, npm update --prod

to install specific version
npm i gulp@1.8.2
to update one pkg npm update gulp


update all globle dependency 
npm update -g // be careful if u run this as it will update all the dependency at a time.
npm update -g gulp

iff u wanna install a pkg direct from github then 
npm install https://github.com/strongloop/express
not only from github . . you can install pkg from other url also giving like this.
___________________________________
some time u have to install pkg from private folder not from npm ppkg list :: 
npm i ../folder_of_pkg
npm i ../folder_of_pkg --save

npm pruning :: 
npm prune // it will remove all the pkg from installed pkg and keep ony those which are thr in pkg.json
//use case of it is u are trying somthing with pkg with --save and then it didnt worked so u can see all unwanted pkg by
//npm list --depth 0 // and now u can prune it and clear and keep only those pkg which is gvn in pkg.json

// if u wanna go to git url npm repo gulp will take u to that official git url.
___________________________________
upgrade npm itself :: 
npm i npm@letest -g // always run this command in root user.
___________________________________
running scripts (custom scripts) // scripts can be mension in pkg.json file and run as ex: 
"scripts" : {
	"test" : "test.js", // to run this use npm test
	"start" : "index.js" // npm start.
} 







