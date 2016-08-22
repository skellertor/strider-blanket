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
      scope.$watch('data.html', function (value) {
        attrs.$set('src', 'data:text/html,' + value);
      },true);
    }
  };
});
