'use strict';

(function() {

function FilesResource($resource) {
  return $resource('/api/cloud/files', {},
    {get:
      {
        method: 'GET'
      }
    }
  );
}

angular.module('dropzoneApp')
  .factory('Files', FilesResource);

})();
