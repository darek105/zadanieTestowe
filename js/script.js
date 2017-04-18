'use strict'

var offsetPokemon = 20;
var $divAjaxLoader = $('<div>').addClass('loader')
var $ajaxLoader = $('<img>').attr('src', `img/ajax-loader.gif`);
var $showPokemon = $('.show-pokemon');
var $pokemonsBox = $('.pokemons-box');
var $showMore = $('.show-more');
var $searchType = $('.search_type')

$divAjaxLoader.append($ajaxLoader);

const option = {
  headers: {
    'Content-Type': 'app/json'
  },
  mode: 'cors'
};

$showPokemon.on('click', function(e) {
  e.preventDefault();

  $pokemonsBox.append($divAjaxLoader);
  $pokemonsBox.children().remove();

  let pokemons = [""];

  let pokemonsCalls = pokemons.map(() => {
    return fetch(`http://pokeapi.co/api/v2/pokemon/`, option)
  });

  getPromiseData(pokemonsCalls).then(value => {
    // console.log(result);
    allPokemon(value);
  });

});

$showMore.on('click', function(e) {
  e.preventDefault();

  $pokemonsBox.append($divAjaxLoader);

  let pokemons = [""];

  let pokemonsCalls = pokemons.map(() => {
    return fetch(`http://pokeapi.co/api/v2/pokemon/?offset=` + offsetPokemon, option)
  });

  getPromiseData(pokemonsCalls).then(value => {
    // console.log(result);
    allPokemon(value);
  });

  offsetPokemon += 20;
  // console.log(offsetPokemon);

});

$searchType.on('submit', function(e) {
  e.preventDefault();

  $pokemonsBox.children().remove();
  $pokemonsBox.append($divAjaxLoader);

  let types = $(this).children('input').val().replace(/\s/g, '');
  types = types.split(',');

  let trainerTypeCalls = types.map(val => {
    return fetch(`http://pokeapi.co/api/v2/type/${val}/`, option)
  });

  getPromiseData(trainerTypeCalls).then(result => {
    // console.log(result);
    getHalfDamagePokemon(result);
  });

});

function allPokemon(pokemonType) {

  pokemonType = pokemonType.map(type => {
    return type.results
  }).reduce((a, b) => [
    ...a,
    ...b
  ], []).map(type => {
    return fetch(type.url, option)
  });

  getPromiseData(pokemonType).then(results => {
    console.log(results);
    showPokemon(results);
  });

}

function getHalfDamagePokemon(pokemonType) {

  pokemonType = pokemonType.map(type => {
    return type.damage_relations.half_damage_from
  }).reduce((a, b) => [
    ...a,
    ...b
  ], []).map(type => {
    return fetch(type.url, option)
  });

  getPromiseData(pokemonType).then(results => {
    let tmpTab = [];
    let pokemons = results.map(pokemon => {
      return pokemon.pokemon;
    }).reduce((a, b) => [
      ...a,
      ...b
    ], []).map(pokemon => pokemon.pokemon);

    for (let i = 0; i < 20; i++) {
      tmpTab.push(pokemons[i]);
    }

    tmpTab = tmpTab.map(pokemon => {
      return fetch(pokemon.url, option);
    });

    getPromiseData(tmpTab).then(pokemonData => {
      // console.log(pokemonData);
      showPokemon(pokemonData);
    });
  });

}

function getPromiseData(promisesArray) {
  return new Promise((resolve, reject) => {
    Promise.all(promisesArray).then(res => {
      return res.map(type => type.json());
    }).then(res => {
      Promise.all(res).then(resolve);
    }).catch(reject);
  });
}

function showPokemon(pokemon) {
  $pokemonsBox.children('div.loader').remove();
  pokemon.forEach(pokemon => {
    var $box = $('<div>').addClass('pokemon');
    var $img = $('<img>').attr('src', `http://pokeapi.co/media/img/${pokemon.id}.png`);
    var $name = $('<h2>').text(pokemon.name);
    var $expreience = $('<span>').text("Expreience: " + pokemon.base_experience);
    var $height = $('<span>').text("Height: " + pokemon.height);
    var $weight = $('<span>').text("Weight: " + pokemon.weight);
    $box.append($img, $name, $expreience, $height, $weight);
    $pokemonsBox.append($box);
  });

  $showMore.css('display', 'block');
}
