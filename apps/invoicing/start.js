
msos.provide('apps.invoicing.start');


apps.invoicing.start.css = new msos.loader();

// Load the page specific css (but after ./config.js loaded css)
apps.invoicing.start.css.load(msos.resource_url('apps', 'invoicing/style.css'), 'css');

msos.onload_func_done.push(
	function () {

		var temp_sd = 'apps.invoicing.start -> ',
            read_url = function (input) {
                if (input.files && input.files[0]) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        $('#company_logo').attr('src', e.target.result);
                    };
                    reader.readAsDataURL(input.files[0]);
                }
            };

		msos.console.debug(temp_sd + 'start.');

        apps.invoicing.start = angular.module('apps.invoicing.start', []);

		// create the controller and inject Angular's $scope
		apps.invoicing.start.controller(
			'InvoiceController',
			['$scope', function ($scope) {

				msos.console.debug(temp_sd + 'InvoiceController called!');

                $scope.logoRemoved = false;
                $scope.printMode = false;

                var sample_invoice = {
                        tax: 13.00,
                        invoice_number: 10,
                        customer_info: {
                            name: "Mr. John Doe",
                            web_link: "John Doe Designs Inc.",
                            address1: "1 Infinite Loop",
                            address2: "Cupertino, California, US",
                            postal: "90210"
                        },
                        company_info: {
                            name: "Metaware Labs",
                            web_link: "www.metawarelabs.com",
                            address1: "123 Yonge Street",
                            address2: "Toronto, ON, Canada",
                            postal: "M5S 1B6"
                        },
                        items:[
                            { qty: 10, description: 'Gadget', cost: 9.95 }
                        ]
                    };

                if (localStorage.invoice === undefined || localStorage.invoice === null) {
                    $scope.invoice = sample_invoice;
                } else {
                    $scope.invoice =  JSON.parse(localStorage.invoice);
                }

                $scope.addItem = function () {
                    $scope.invoice.items.push({qty:0, cost:0, description:""});    
                };

                $scope.removeLogo = function () {
                    var elem = angular.element("#remove_logo");
                    if (elem.text() == "Show Logo") {
                        elem.text("Remove Logo");
                        $scope.logoRemoved = false;
                    } else{
                        elem.text("Show Logo");
                        $scope.logoRemoved = true;
                    }
                };

                $scope.editLogo = function () {
                    jQuery("#imgInp").trigger("click");
                };

                $scope.showLogo = function () {
                    $scope.logoRemoved = false;
                };

                $scope.removeItem = function (item) {
                    $scope.invoice.items.splice($scope.invoice.items.indexOf(item), 1);    
                };

                $scope.invoice_sub_total = function () {
                    var total = 0.00;
                    angular.forEach(
                        $scope.invoice.items,
                        function (item) {
                            total += (item.qty * item.cost);
                        }
                    );
                    return total;
                };

                $scope.calculate_tax = function () {
                    return (($scope.invoice.tax * $scope.invoice_sub_total()) / 100);
                };

                $scope.calculate_grand_total = function () {
                    localStorage.invoice = JSON.stringify($scope.invoice);
                    return $scope.calculate_tax() + $scope.invoice_sub_total();
                }; 

                $scope.printInfo = function() { window.print(); };

                $scope.clearLocalStorage = function () {
                    var confirmClear = confirm("Are you sure you would like to clear the invoice?");
                    if (confirmClear) {
                        localStorage.invoice = "";
                        $scope.invoice = sample_invoice;
                    }
                };
            }]
        );

        // Create our directive
        apps.invoicing.start.directive(
            'jqAnimate',
            function () { 
                return function (scope, instanceElement) { 
                    setTimeout(
                        function () { instanceElement.show('slow'); },
                        0
                    ); 
                }; 
            }
        );

        // Add some setup
        jQuery("#invoice_number").focus();

        jQuery("#imgInp").change(
            function (){ read_url(this); }
        );

        // Then bootstrap...
		angular.bootstrap('body', ['apps.invoicing.start']);

		msos.console.debug(temp_sd + 'done!');
	}
);
