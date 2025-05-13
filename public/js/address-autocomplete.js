let autocomplete;

function initAutocomplete() {
  const addressInput = document.getElementById('address-input');
  if (!addressInput) {
    console.error('Address input field not found for Google Autocomplete.');
    return;
  }

  autocomplete = new google.maps.places.Autocomplete(addressInput, {
    types: ['geocode'],
    fields: ['place_id', 'name', 'formatted_address', 'geometry.location']
  });

  autocomplete.addListener('place_changed', fillInAddress);
}

function fillInAddress() {
  const place = autocomplete.getPlace();

  const formattedAddressInput = document.getElementById('formattedAddress');
  const latitudeInput = document.getElementById('latitude');
  const longitudeInput = document.getElementById('longitude');
  const placeIdInput = document.getElementById('placeId');
  const addressInput = document.getElementById('address-input');

  if(formattedAddressInput) formattedAddressInput.value = '';
  if(latitudeInput) latitudeInput.value = '';
  if(longitudeInput) longitudeInput.value = '';
  if(placeIdInput) placeIdInput.value = '';

  if (!place || !place.geometry || !place.geometry.location) {
    console.warn("No details available for input: '" + (place ? place.name : addressInput.value) + "'");
    return;
  }

  if (addressInput && place.formatted_address) {
    addressInput.value = place.formatted_address;
  }

  if (formattedAddressInput && place.formatted_address) {
    formattedAddressInput.value = place.formatted_address;
  }
  if (latitudeInput) {
    latitudeInput.value = place.geometry.location.lat();
  }
  if (longitudeInput) {
    longitudeInput.value = place.geometry.location.lng();
  }
  if (placeIdInput && place.place_id) {
    placeIdInput.value = place.place_id;
  }
}