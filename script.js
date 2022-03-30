

const wholeApp = angular.module('app', ['ngRoute','storeModule','cartModule','checkoutModule']);

wholeApp.constant('IMG_BASE_URL', 'https://s3.eu-central-1.amazonaws.com/images-il.rexail.com/');

wholeApp.factory('service',  function(){
  
});
wholeApp.config(function ($routeProvider, $locationProvider) {

  $routeProvider
    .when('/store', {
      templateUrl: 'views/store.html',
      controller: "storeController",
      controllerAs: "ctrl",
    })
    .when('/cart', {
      templateUrl: 'views/card.html',
      controller: 'cartController',
      controllerAs: "ctrl",
    })
    .when('/checkout', {
      templateUrl: 'views/checkout.html',
      controller: 'checkoutController',
      controllerAs: "ctrl",
    })
    .otherwise({
      redirectTo: '/store'
    });
});


wholeApp.constant('IMG_BASE_URL', 'https://s3.eu-central-1.amazonaws.com/images-il.rexail.com/');
wholeApp.run(function ($rootScope, $http, $location, IMG_BASE_URL) {
  $rootScope.globalState = {
    total:0.00,
    productsToShow: [],
    categoryToShow:[],
    savedProducts: [],
    savedProducts2: [],
    productsMightHaveMissed: [],
    
    data: {
      storeData: [],
      productsData: []
    },
  };

  function fetchAppData() {
    $http.get('https://test.rexail.co.il/client/public/store/website?domain=testeitan.rexail.co.il')
        .then(function (response) {
            // Loading store data to root scope
            $rootScope.globalState.storeData = response.data.data;
            $http.get(`https://test.rexail.co.il/client/public/store/catalog?s_jwe=${$rootScope.globalState.storeData.jsonWebEncryption}`)
                .then(function (response) {
                    // Formatting data products by categories
                    
                    $rootScope.globalState.data.categoriesData = formatData(response.data.data);
                    $rootScope.globalState.data.categoriesData.forEach(category=>{
                      category.children.forEach(item=>{
                        $rootScope.globalState.data.productsData.push(item)
                      })
                        
                      
                    })
                     
                    console.log( $rootScope.globalState.data.categoriesData );
                    
                });
        });
}

fetchAppData();


function formatData(array) {
  return Object.values(array.reduce((obj, current) => {
    if (!obj[current.productCategory.id]) {
      obj[current.productCategory.id] = {
        id: current.productCategory.id,
        name: current.productCategory.name,
        children: []
      };
    }

    obj[current.productCategory.id].children.push({
      id: current.product.id,
      name: current.product.name,
      fullName: current.fullName,
      defaultSellingUnit: current.product.defaultSellingUnit,
      imageUrl: IMG_BASE_URL.concat(current.imageUrl),
      productSellingUnits: current.productSellingUnits,
      price: current.price,
      promoted: current.promoted,
      oldPrice: current.oldPrice,
      originalPrice: current.originalPrice,
      productQuality: current.productQuality,
      currentRelevancy: current.currentRelevancy
    });

    return obj;
  }, {}));
}
});



wholeApp.service('actions',function($rootScope){
  const service = this;

  service.decreaseQuantity = function (product) {
    if (product.quan >= 2) product.quan--;
    $rootScope.globalState.total = service.calculateTotal();
  };


  service.increaseQuantity = function (product) {
   
  
    if (product.choosenUnit.name == 'מארז' || product.choosenUnit.name == "יח'") {
      product.quan = parseInt(product.quan) + 1;
    } else if (product.choosenUnit.amountJumps) {
      product.quan += product.choosenUnit.amountJumps;
    } else if (product.defaultSellingUnit) {
      product.quan += product.defaultSellingUnit.amountJumps;
    } else {
      product.quan++;
    }
    $rootScope.globalState.total = service.calculateTotal();

  };

  service.removeProduct = function (product) {
    product.quan = 0;
    $rootScope.globalState.savedProducts.splice($rootScope.globalState.savedProducts.indexOf(product), 1);
    $rootScope.globalState.total = service.calculateTotal();
  };


  service.removeEntireBasket = function () {
    $rootScope.globalState.savedProducts.map(product => product.quan = 0);
    $rootScope.globalState.savedProducts = [];
    $rootScope.globalState.total = service.calculateTotal();
  };


 service.calculateTotal = function calculateTotal() {

    return $rootScope.globalState.savedProducts.reduce((total, product) => total + product.quan * product.price, 0).toFixed(2);

  }

  service.chooseUnit = function (product, unit) {
    product.choosenUnit = unit.sellingUnit;
    if (product.choosenUnit.name == 'מארז' || product.choosenUnit.name == "יח'") {
      product.quan = parseInt(product.quan + 0.5);

    }
  };
})



wholeApp.directive('navBar', function () {
  return {
    templateUrl: 'directives/nav-menu.html',
    replace: true,
  };
});
wholeApp.directive('bigFooter', function () {
  return {
    templateUrl: 'directives/big-footer.html',
    replace: true,
  };
});
wholeApp.directive('smallFooter', function () {
  return {
    templateUrl: 'directives/small-footer.html',
    replace: true,
  };
});
wholeApp.directive('bigNavBar', function () {
  return {
    templateUrl: 'directives/big-nav-menu.html',
    replace: true,
  };
});


