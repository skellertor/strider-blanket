// app.directive('htmlSrc', function () {
//   return {
//     restrict: 'A',
//     link: function (scope, element, attrs) {
//       scope.$watch(attrs.htmlSrc, function (value) {
//         attrs.$set('src', 'data:text/html,' + value);
//       });
//     }
//   };
// });
app.directive('htmlSrc', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      scope.$watch('job.plugin_data.blanket', function (value) {
        scope.data = value;
      });
      scope.$watch('showStatus[job.ref.branch]', function (value) {
        if(value) {
          var classes = document.getElementsByClassName('status-blanket').className;
          if(classes.indexOf('ng-hide') !== -1) {
            var newClasses = classes.replace(/ng-hide/, '');
            document.getElementsByClassName('status-blanket').className = newClasses;
          }
        }
        scope.show = value;
      });
      scope.$watch('job', function (value) {
        scope.job = value;
      });
    }
  };
});
