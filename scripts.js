"use strict";

$(function() {
    var apiUrl = "http://prototypehold1.azurewebsites.net/api/ComponentLists/";
    var name = "stdList";
    var highlightClass = "success";
    var components = [];
    var timeout = 1500;

    init();

    function init() {
        stopDatasheetPropagation();
        setTooltips();
        setTables();
        setGlobalSearch();
        setNav();
        setList();
        getLatest(function() {
            setHightlighting();
            addButtons();
        });
        setDataSync();
    }

    function setNav() {
        $(".tab-header").hide();

        $("#tabs li").click(function() {
            $(".tab-header").hide();
        });
    }

    function setTooltips() {
        $(".glyphicon-picture").tooltip({
            placement: "auto left",
            html: true,
            title: function() {
                var type = $(this).data("type");
                return "<img src='" + type + ".jpg' height='150' width='150' />";
            }
        });
    }

    function stopDatasheetPropagation() {
        $("a[href^='datasheet.pdf'").click(function(e) {
            e.stopPropagation();
        });
    }

    function setTables() {
        var dataTableOptions = {
            paging: false,
            ordering: false,
            info: false,
            columnDefs: [
                { targets: -1, orderable: false }
            ]
        };

        // DataTable
        var tables = $(".table");
        for (var index = 0; index < tables.length; index++) {
            var table = tables[index];

            var dataTable = $(table).DataTable(dataTableOptions);
            enableColumnFilter(dataTable);
        }

        function enableColumnFilter(table) {
            table.columns().every(function() {
                var that = this;
                $('input', that.header())
                    .on('keyup change', function() {
                        if (that.search() !== this.value) {
                            that
                                .search(this.value)
                                .draw();
                        }
                    });
            });
        }
    }

    function setList() {
        $("tbody tr").click(function(e) {
            showSyncDiv();
            var self = $(this);

            var r = $(e.currentTarget).children();

            var s = getDtoName(r);

            if (self.hasClass(highlightClass)) {

                for (var index = 0; index < components.length; index++) {
                    var component = components[index];

                    if (component.Name === s) {
                        self.removeClass(highlightClass);
                        components.pop(component);
                        break;
                    }
                }
            } else {
                self.addClass(highlightClass)
                components.push({ Name: s });
            }

            postList();
            invertSign(self);
        });
    }

    function showSyncDiv() {
        $(".sync").show();
        setTimeout(function() {
            $(".sync").hide();
        }, 600);
    }

    function addButtons() {
        var item = $("tbody tr");
        for (var i = 0; i < item.length; i++) {
          var inner = $(item[i]).find("td p")
          if(!$(item[i]).hasClass(highlightClass)){
              inner.append('<span class="glyphicon glyphicon-large glyphicon-plus-sign"></span>')
          } else {
              inner.append('<span class="glyphicon glyphicon-large glyphicon-minus-sign"></span>')
          }
        }
    }

    function invertSign(selector) {
        var ptag = selector.find("td p");
        var spans = ptag.find("span");
        if(!selector.hasClass(highlightClass)){
            $(spans[2]).replaceWith('<span class="glyphicon glyphicon-large glyphicon-plus-sign"></span>')
        } else {
            $(spans[2]).replaceWith('<span class="glyphicon glyphicon-large glyphicon-minus-sign"></span>')
        }
    }

    function getDtoName(row) {
        var s = "";
        for (var rI = 0; rI < row.length - 1; rI++) {
            var td = row[rI];
            s += td.innerText + ";";
        }
        return s;
    }

    function setHightlighting() {
        var rows = $("tr");

        for (var index = 0; index < rows.length; index++) {
            var row = $(rows[index])[0];

            for (var compIndex = 0; compIndex < components.length; compIndex++) {
                var component = components[compIndex];

                if (getDtoName($(row).children()) === component.Name) {
                    $(row).addClass("success");
                    break;
                }
            }
        }
    }

    function clearHighlighting() {
        $("table tr.success").removeClass("success");
    }

    function setGlobalSearch() {
        var search = $("#search");

        search.on("keyup change", function() {
            $("#tabs li").removeClass("active");
            $(".tab-pane").addClass("active");
            $(".tab-header").show();
        });
    }

    /*
     *
     * API data handling
     *
     **/
    function setDataSync() {
        syncData();

        setInterval(syncData, timeout);

        function syncData() {
            getLatest(function() {
                setHightlighting();
            });
        }
    }

    function postList() {
        deleteAll(function() {
            var dto = {
                Name: name,
                Components: components
            }

            $.ajax({
                url: apiUrl,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(dto),
                dataType: 'json'
            });
        });
    }

    function getLatest(callback) {
        getAll(function(data) {
            components = [];
            if (data.length !== 0) {
                var lastIndex = data.length - 1;
                var list = data[lastIndex];

                for (var index = 0; index < list.Components.length; index++) {
                    var component = list.Components[index];
                    components.push({ Name: component.Name });
                }
            } else {
                clearHighlighting();
            }

            if (typeof callback === "function") {
                callback();
            }
        });
    }

    function getAll(callback) {
        $.ajax({
            url: apiUrl,
            type: 'GET',
            success: function(data) {
                callback(data);
            }
        });
    }

    function deleteAll(callback) {
        getAll(function(data) {
            for (var index = 0; index < data.length; index++) {
                var list = data[index];
                deleteList(list.Id);
            }
        });
        callback();
    }

    function deleteList(id, callback) {
        $.ajax({
            url: apiUrl + id,
            type: "DELETE",
            success: callback
        });
    }
});
