// Models
const TypeOffer = require('app/models/TypeOffer');

let teaTypeOffer = new TypeOffer({
    name: 'Чай',
    image: 'tea.png'
});

teaTypeOffer.save();

let tennisTypeOffer = new TypeOffer({
    name: 'Теннис',
    image: 'tennis.png'
});

tennisTypeOffer.save();

let sportTypeOffer = new TypeOffer({
    name: 'Турники',
    image: 'sport.png'
});

sportTypeOffer.save();