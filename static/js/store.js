(function(){
	//code goes here

	'use strict';

	angular.module('bookstoreapp', [])
	.constant('MANDRILL_BASE', 'https://mandrillapp.com/api/1.0/')
	.constant('WPG_EMAIL', 'info@writersprojectghana.com')
	.constant('WPG_TRANSACTION_NUMBER', '026-169-5952')
	.constant('PARSE_APP_ID', 'DaSLysAGwnv8XyixHYYtLcEeivNDHD0yyuuU6pA1')
	.constant('PARSE_JAVASCRIPT_KEY', 'yopYGWqiv5xzLBoe3mAewzyJOPpBTwg9aMKzShBt')
	.factory('listingService', listingServiceFunction)
	.factory('orderService', orderServiceFunction)
	.controller('mainCtrl', mainCtrlFunction);

	function listingServiceFunction($http, PARSE_APP_ID, PARSE_JAVASCRIPT_KEY){
		//api
		return {
			getBooks: getBooks,
			getBooksFromParse: getBooksFromParse,
			getRegions: getRegions
		}

		//private methods
		function getBooks(){
			var req = {
				method: 'GET',
				url: 'static/data/books.json'
			}
			return $http(req);
		}

		function getRegions(){
			var req = {
				method: 'GET',
				url: 'static/data/regions.json'
			}
			return $http(req);
		}

		function getBooksFromParse(){
			var req = {
				method: 'GET',
				url: "https://api.parse.com/1/classes/Books",
				headers: {
					"X-Parse-Application-Id": PARSE_APP_ID,
					"X-Parse-Javascript-Key": PARSE_JAVASCRIPT_KEY,
					"Content-Type": "application/json"
				}
			}
			return $http(req);
		}
	}

	function orderServiceFunction($http, MANDRILL_BASE, WPG_EMAIL, WPG_TRANSACTION_NUMBER){
		//api
		return {
			sendOrder: sendOrder
		}

		//private methods
		function sendOrder(order){
			var detailsString = "";
			var detailsHTML = "<table style='width:100%;border: 1px solid black;'><tr><th>Title</th><th>Qty</th><th>Unit Price</th></tr>";
			order.cart.forEach(function(item){
				detailsString += "Title: " + item.title + " Qty: " + item.qty + " Unit Price: " + item.amount + "\n";
				detailsHTML += "<tr><td>" + item.title + "</td><td>" + item.qty + "</td><td>" + item.amount + "</td></tr>";
			});
			//append end of table
			detailsHTML += "</table>";
			var msg = "Your order for \n" + detailsString + " was received! \n" + "Please transfer " + order.totalAmount + " cedis to "+ WPG_TRANSACTION_NUMBER + " from any valid mobile money agent with the following code: " + order.orderId + "\n Thank You!";
			var msgHTML = "<h1>Your order was received!</h1> <br><br>" 
			+ "<h3>Details</h3>"
			+ "<p>Ordering Number: " + order.phoneNumber + "</p>"
			+ "<p>Ordering Email: " + order.email + "</p>"
			+ "<p>Location: " + order.location + "</p>"
			+ "<p>Delivery Option: " + order.deliveryOption + "</p>"
			+ "<p>Full Name: " + order.fullName + "</p>"
			+ "<p>Address (Optional): " + order.address + "</p>"
			+ detailsHTML
			+ "Please <strong>transfer " + order.totalAmount + " Ghana cedis to "+ WPG_TRANSACTION_NUMBER + " </strong> from any valid mobile money agent <strong>with the following code: " + order.orderId + "</strong><br><br> Thank You!";
			var mandrillPayload = {
				"key": "PQOiNGsllE7pF8uDhU8ZzQ",
				"message": {
					"html": msgHTML,
					"text": msg,
					"subject": "Order #" + order.orderId + " from " + order.phoneNumber,
					"from_email": WPG_EMAIL,
					"from_name": "Writer's Project of Ghana",
					"to": [
					{
						"email": order.email,
						"name": "Reader",
						"type": "to"
					}
					],
					"headers": {
						"Reply-To": "message.reply@example.com"
					},
					"important": true,
					"track_opens": true,
					"preserve_recipients": false,
					"bcc_address": WPG_EMAIL,
					"metadata": {
						"website": "www.writersprojectghana.com"
					}
				},
				"async": false,
				"ip_pool": "Main Pool"
			}

			var req = {
				method: 'POST',
				url: MANDRILL_BASE + 'messages/send.json',
				data: mandrillPayload
			}
			return $http(req);
		}
	}

	function mainCtrlFunction($scope, listingService, orderService){

		$scope.currentBook = {};
		$scope.order = {};
	//	$scope.places = ['East Legon', 'Legon Campus', 'KNUST', 'Obuasi'];

		/*
		Use objects to represent delivery options + weight coefficients and other properties.
		Cost is restricted to cedis for now.
		*/
		$scope.deliveryOptions = [
			{
				name: 'EMS',
				weightCoefficient: '10'
			},
			{
				name: 'Ghana Post',
				weightCoefficient: '4'
			},
			{
				name: 'Graphic Parcel Service',
				weightCoefficient: '6'
			},
			{
				name: 'VIP (bus courier)',
				weightCoefficient: '8'
			},
			{
				name: 'STC (bus courier)',
				weightCoefficient: '4'
			}
		];

		/*
		Include a list of regions the user must select from.
		Each region has its associated cost
		*/

		// listingService.getRegions().then(function(success){
		// 	console.log("Regions: ", success.data);
		// 	$scope.regions = success.data;
		// }, function(error){
		// 	//do nothing!
		// });
		$scope.regions = [
			{
				name: 'Greater Accra',
				cost: '3'
			},
			{
				name: 'Eastern',
				cost: '4'
			},
			{
				name: 'Western',
				cost: '6'
			},
			{
				name: 'Ashanti',
				cost: '7'
			},
			{
				name: 'Volta',
				cost: '5'
			},
			{
				name: 'Central',
				cost: '4'
			},
			{
				name: 'Brong-Ahafo',
				cost: '7'
			},
			{
				name: 'Upper East',
				cost: '9'
			},
			{
				name: 'Upper West',
				cost: '9'
			},
			{
				name: 'Northern',
				cost: '8'
			}
		];

		//load books first
		listingService.getBooks().then(function(success){
			//success
			//$scope.list = success.data;
		}, function(error){
			//error
			console.log(error.data);
		});

		listingService.getBooksFromParse().then(function(success){
			//success
			console.log(success.data.results);
			$scope.list = success.data.results;
		}, function(error){
			//error
			console.log(error);
		})

		//use this function to select a book from the list
		//as the current item for operations
		$scope.selectBook = function(book){
			$scope.currentBook = book;
		}

		//use this function to add books to the cart
		$scope.addToCart = function(book){
			var exists = false;
			if($scope.order.cart == undefined){
				//new cart
				$scope.order.cart = [];
			}
			$scope.order.cart.forEach(function(b){
				if(b.bookId == book.bookId){
					exists = true;
					console.log(b.title + " exists!");
					console.log(b.bookId +"=="+book.bookId);
				}
			});

			if(!exists){
				$scope.order.cart.push(book);
			}
			console.log("Cart :", $scope.order.cart);
		}

		//use this function to view the cart
		$scope.viewCart = function(){
			if($scope.order.cart == undefined){
				$scope.order.cart = [];
			}
		}

		//use this function to clear the cart
		$scope.clearOrder = function(){
			$scope.order.cart.forEach(function(item){
				item.qty = "";
			});
			$scope.order.cart = [];
			$scope.order.deliveryOption = "";
			$scope.order.fullName = "";
			$scope.order.location = "";
			$scope.order.email = "";
			$scope.order.phoneNumber = "";
			$scope.order.region = "";
			$scope.order.address = "";
			//$scope.order = {};
			//$scope.totalCost = 0;
		}

		//use this function to create an order
		//to be sent to WPG
		$scope.makeOrder = function(){
			$scope.order.orderId = guid();
			$scope.order.orderDate = Date();

			//amount may be redundant now that we have a real-time totalCost
			var amount = 0;

			//calculate totalAmount
			//replace with sophisticated ordering function
			$scope.order.cart.forEach(function(item){
				//multiplies the amount by the quantity being purchased
				amount += item.amount * item.qty;
			});
			//rounds amount to a sensible, payable figure
			//replace amount with totalCost
			$scope.order.totalAmount = Math.round($scope.totalCost*100)/100 ;
			console.log($scope.order);

			var isValid = validateOrder($scope.order);
			console.log(isValid);

			if(isValid){			
				//send order notice now if valid...
				orderService.sendOrder($scope.order).then(function(success){
					console.log(success);
					$('#orderModal').modal('show');
				}, function(error){
					console.log(error);
				});
				//after sending order,
				//show user order id..? Not necessary! REMOVE
				//$scope.finalOrderId = $scope.order.orderId;
			} else{
				//...otherwise
				$('#invalidOrderModal').modal('show');
				console.log("order is invalid!");
			}
		}

		//use this function to (re)compute the total cost of your current order
		//triggered when item quantity, region and delivery option are changed
		$scope.computeCost = function(){
			console.log("Calculating cost or order...", $scope.order);
			//cost calculated based on 
			// 1. unit cost of each item (??),
			// 2. weight coefficient (c1) of selected delivery option
			// 3. cost of delivery to chosen region
			// 4. weight is the total weight of the order??

			//total cost = c1 * weightSum * region_cost + bulkSellingPrice
			var weightSum = 0;
			var bulkSellingPrice = 0;
			var weightCoefficient = 1;
			var regionCost = 1;

			$scope.order.cart.forEach(function(item){
				weightSum += item.weight;
				if(!isNaN(item.qty)){
					bulkSellingPrice += item.amount * item.qty;
				}

				console.log("New weightSum and bulkSellingPrice are", weightSum, bulkSellingPrice);
			});

			if($scope.order.hasOwnProperty("deliveryOption")){
				console.log("we have weightCoefficient!");
				$scope.deliveryOptions.forEach(function(op){
					if(op.name == $scope.order.deliveryOption){
						weightCoefficient = op.weightCoefficient
					}
				})
			}

			if($scope.order.hasOwnProperty("region")){
				console.log("we have regionCost!");
				$scope.regions.forEach(function(reg){
					if(reg.name == $scope.order.region){
						regionCost = reg.cost;
					}
				})
			}

			$scope.totalCost = (weightCoefficient * weightSum * regionCost) + bulkSellingPrice;
			console.log("New totalCost is ", $scope.totalCost); 
			console.log("weightCoefficient and regionCost are ", weightCoefficient, regionCost)
		}

		//use this function to generate a unique orderId
		function guid() {
			function s4() {
				return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16);
			}
			return s4();
		}

		//use this function to validate the order befor sending the email
		function validateOrder(order){
			/*
			checks the following properties
			totalAmount
			phoneNumber
			email
			location
			region
			deliveryOption
			fullName
			NOTE: Address is optional
			*/
			var orderKeys = ["totalAmount", "phoneNumber", "email", "location", "region", "deliveryOption", "fullName"];
			var isValid = false;
			orderKeys.forEach(function(key){			
				if(order.hasOwnProperty(key)){
					if(key == undefined){
						isValid = false;
						return
					} else{
						if(isNaN(order.totalAmount)){
							isValid = false;
							return
						}else{
							isValid = true;
						}
					}
				} else{
					isValid = false;
					return
				}
			})
			console.log("return isValid..");
			return isValid
		}
	}
})();