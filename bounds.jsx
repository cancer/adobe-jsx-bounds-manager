var BoundsManager = (function(docObj, settings){
  var custom = settings.custom;
  var defaults = settings.defaults;
  var variable = settings.variable;
  var files = settings.files;

  var boundsManager = function boundsManager(){
    this.boundsContainer = {};
    this.exports = {
      boundsData : [],
      orderData  : [],
      trimData   : {}
    }
  }

  boundsManager.prototype.export = function exportBoundsData(indent){
    indent = indent || files.indentCharacter;

    if(settings.custom.checkSkipCreateConfig.value){
      return;
    }

    var globalOffset = _getGlobalOffset();
    this.exports.orderData = util.objectToYaml({order: this.exports.orderData}, indent);
    this.exports.trimData = util.objectToYaml(globalOffset, indent + ' ');
    this.exports.boundsData = util.objectToYaml(this.boundsContainer, indent + ' ');

    return this.exports;
  }

  boundsManager.prototype.setBounds = function setBoundsData(bounds, vars){
    var depth     = vars.currentDepth;
    var viewName  = vars.currentView;
    var partsName = vars.currentParts;

    if(depth === 1) {
      this.boundsContainer[viewName] = {};
      return null;
    }

    // 一応...
    if(bounds === null){ return null; }

    if(depth === 2) {
      // トリミングの範囲
      var offset = util.boundsToOffset(bounds);

      var boundsViewContainer = this.boundsContainer[viewName];
      boundsViewContainer[partsName] = offset;
      return offset;
    }
  }

  boundsManager.prototype.setOrder = function setOrderData(name){
    this.exports.orderData.push(name);
  }

  boundsManager.prototype.getBounds = function getBoundsData(vars){
    var viewName  = vars.currentView;
    var partsName = vars.currentParts;
    var boundsViewContainer = this.boundsContainer[viewName];

    if(partsName == null){
      return boundsViewContainer;
    }

    return boundsViewContainer[partsName];
  }

  //
  //----- 座標指定用configファイル作成
  //
  function createConfFile(fileName) {
    var fileObj = new File(util.getPath( docObj ) + "/" + fileName);
    fileObj.remove();

    return fileObj || null;
  }

  // トリミング用のオフセット値を取得
  function _getGlobalOffset(){
    docObj.activeLayer = settings.defaults.guide_dir;
    var guide = docObj.activeLayer;
    var exportTrimBounds = {};
    var exportTrimView = settings.defaults.export_trim_view;
    var exportTrimList = settings.defaults.export_trim_list;
    var exportTrimKeys = settings.defaults.export_trim_keys;

    _.each(exportTrimView, function(view){
      exportTrimBounds[view] = {};

      _.each(exportTrimList, function(val, idx){
        docObj.activeLayer = guide.layers[view + "_trim_" + val];
        var guideLayer = docObj.activeLayer;
        var bounds = guideLayer.bounds;

        this[val] = util.boundsToOffset(bounds);

      }, exportTrimBounds[view]);
    });

    return exportTrimBounds;
  }

  return boundsManager;

})(app.activeDocument, settings);

