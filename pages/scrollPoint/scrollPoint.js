Page({
  data: {
      list: ["list0", "list1", "list2", "list3", "list4", "list5", "list11", "list12", "list13", "list14", "list15", "list25", "list26", "list27", "list28", "list29", "list30"],
      toView: ''
    },
  clickScroll:function(e){
    var id = e.currentTarget.dataset.id
    this.setData({
      toView:id
    })
    console.log(e.currentTarget.dataset);
  },
})