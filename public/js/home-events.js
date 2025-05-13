document.addEventListener('DOMContentLoaded',function(){
  document.querySelectorAll('.event-list-item').forEach(function(item){
    item.addEventListener('click',function(e){
      var t=e.target;
      while(t&&t.nodeType!==1)t=t.parentNode;
      if(t&&t.closest('form'))return;
      window.location.href='/events/'+item.dataset.eventId;
    });
    item.querySelectorAll('form').forEach(function(form){
      form.addEventListener('click',function(e){
        e.stopPropagation();
      });
      form.addEventListener('submit',function(e){
        e.stopPropagation();
      });
    });
  });
}); 