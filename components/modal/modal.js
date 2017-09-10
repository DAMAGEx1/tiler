(function () {
    'use strict';
    angular
        .module('app').component('modalComponent', {
        templateUrl: ['$stateParams', function ($stateParams) {
            return 'components/modal/templates/' + $stateParams.type + ".html";
        }],
        bindings: {
            post: '<',
            avatars: '<'
        },
        controller: ('ModalController', ModalController),
        controllerAs: 'modal'
    });

    // Start modal component
    ModalController.$inject = ['$state', 'AuthService', 'CommonService'];
    function ModalController($state, AuthService, CommonService) {

        var modal = this,
            modalElement = jQuery('#modalWindow');

        //  Show modal on init
        modal.$onInit = function() {
            modalElement.modal('show');
        };

        //  Back state on hidden modal
        modalElement.on('hidden.bs.modal', function (e) {
            $state.go('^');
        });

        modal.postHandler = function () {

        };

        modal.authHandler = function () {
            modal.authView = true;
            modal.regView = false;

            //  Disable avatar carousel sliding
            angular.element('#carouselDefaultAvatars').carousel({
                interval: 0
            });

            //  Convert default avatar to base64
            CommonService.getBase64(window.location.origin + '/img/default-avatars/captainamerica.png').then(function (response) {
                modal.reg.avatar = response;
            });

            //  Get selected avatar of user
            angular.element('#carouselDefaultAvatars').on('slide.bs.carousel', function (e) {
                CommonService.getBase64(angular.element(e.relatedTarget).find('img')[0].src).then(function (response) {
                    modal.reg.avatar = response;
                });
            });

            modal.auth = {
                email: '',
                password: ''
            };

            modal.reg = {
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                terms: true
            };

            modal.authSwitch = function () {
                modal.authView === true ? modal.authView = false : modal.authView = true;
                modal.regView === true ? modal.regView = false : modal.regView = true;
            };

            modal.authSuccess = function () {
                modalElement.modal('hide');

                //  TODO: this retrieve transition error
                modalElement.on('hidden.bs.modal', function (e) {
                    $state.go('settings');
                });
            };

            modal.authUser = function (isValid) {
                modal.authFormSubmitted = true;

                if (isValid) {
                    AuthService.authorizationUser(modal.auth).then(function (response) {
                        response.success ? modal.authSuccess() : modal.authFormServerError = response.data;
                    })
                }
            };

            modal.regUser = function(isValid) {
                modal.regFormSubmitted = true;

                if (isValid) {
                    AuthService.registrationUser(modal.reg).then(function (response) {
                        if (response.success) {
                            modal.firstAuth = {
                                email : modal.reg.email,
                                password : modal.reg.password
                            };
                            AuthService.authorizationUser(modal.firstAuth).then(function (response) {
                                response.success ? modal.authSuccess() : $state.go('error');
                            });
                        } else {
                            modal.regFormServerError = response.data.errors;
                            modal.regFormServerError.takenEmail = modal.reg.email;
                        }
                    })
                }
            };

        };

        //  Handler division of work by type
        switch($state.params.type) {
            case 'post': modal.postHandler();
                break;
            case 'auth': modal.authHandler();
                break;
            default:
                break
        }

    }

    //  Filter for description post text
    angular.module('app').filter('unsafe', ['$sce', function ($sce){
        return $sce.trustAsHtml;
    }])

})();