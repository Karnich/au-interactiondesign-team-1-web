$(function () {
    const apiUrl = "http://prototypehold1.azurewebsites.net/api/ComponentLists/";
    const name = "stdList";
    const highlightClass = "success";
    var loading;
    var components = [];

    init();

    function init() {
        loading = $("#loading").hide();

        setTooltips();
        setTables();
        setDataSync();
        setGlobalSearch();
        setNav();
        setList();
    }

    function setNav() {
        $(".tab-header").hide();

        $("#tabs li").click(function () {
            $(".tab-header").hide();
        });
    }

    function setTooltips() {
        $(".glyphicon-picture").tooltip({
            placement: "auto left",
            html: true,
            title: function () {
                var type = $(this).data("type");
                return "<img src='" + type + ".jpg' height='150' width='150' />";
            }
        });
    }

    function setTables() {
        var dataTableOptions = {
            paging: false,
            ordering: false,
            info: false,
        };
    
        // DataTable
        var tables = $(".table");
        for (var index = 0; index < tables.length; index++) {
            var table = tables[index];

            var dataTable = $(table).DataTable(dataTableOptions);
            enableColumnFilter(dataTable);
        }

        function enableColumnFilter(table) {
            table.columns().every(function () {
                var that = this;
                $('input', that.header())
                    .on('keyup change', function () {
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
        $("tbody tr").click(function (e) {
            var self = $(this);

            var component = e.currentTarget.innerText;

            if (self.hasClass(highlightClass)) {
                self.removeClass(highlightClass);

                for (var index = 0; index < components.length; index++) {
                    var element = components[index];
                    if (element.Name === component) {
                        components.pop(element);
                        break;
                    }
                }
            } else {
                self.addClass(highlightClass)
                components.push({ Name: component });
            }
        });
    }

    function setGlobalSearch() {
        var search = $("#search");

        search.on("keyup change", function () {
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
        // set interval
        // var timer = setInterval(syncData, 2000);
        $("#sendData").click(syncData);

        function syncData() {
            loading.show();

            //getLatest();

            deleteOldList();

            postData();
        }

        // $("#loadData").click(getLatest);
        //         function getLatest() {
        //             if (latestId) {
        //                 $.ajax({
        //                     url: apiUrl,
        //                     type: 'GET',
        //                     success: function (data) {
        //                         var lastIndex = data.length - 1;
        // 
        //                         console.log(data[lastIndex]);
        // 
        //                         if (data[lastIndex].Id !== latestId) {
        //                             clearComponents();
        //                         }
        //                     }
        //                 });
        //             }
        //         }
        
        function clearComponents() {
            components = [];

            $("table tr .active").removeClass("active");
        }

        function postData() {
            var dto = {
                Name: name,
                Components: components
            }

            $.ajax({
                url: apiUrl,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(dto),
                dataType: 'json',
                success: postDone
            });
        }

        var latestId;

        function deleteOldList() {
            if (latestId) {
                $.ajax({
                    url: apiUrl + latestId,
                    type: 'DELETE'
                });
            }
        }

        function postDone(data) {
            latestId = data.Id;
            loading.hide();
        }
    }
});
