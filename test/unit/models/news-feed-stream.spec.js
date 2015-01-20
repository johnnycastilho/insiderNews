'use strict';

var chai = require('chai');
var configurations = require('../../../core/configurations/index.js');
var createNewsFeedStream = require(configurations.paths.models + 'news-feed-stream.js');
var createMockRepository = require('../mocks/news-feed-stream.repository.js');


describe('[model] newsFeedStream', function () {

  it('deve ser uma Factory (função)', function() {
    createNewsFeedStream.should.be.a('function');
  });

  it('deve retornar erro quando executado sem repositório', function() {
    chai.expect(function(){
      createNewsFeedStream();
    }).to.throw(Error);
  });

  it('deve retornar um objeto quando executado com repositório', function() {
    var repository = createMockRepository();


    createNewsFeedStream({ repository: repository }).should.be.a('object');
  });

  it('deve conter a propriedade "events"', function() {
    var repository = createMockRepository();
    var newsFeedStream = createNewsFeedStream({ repository: repository });

    newsFeedStream.should.have.property('events');
    newsFeedStream.should.be.a('object');
  });

  it('deve conter o método "start"', function() {
    var repository = createMockRepository();
    var newsFeedStream = createNewsFeedStream({ repository: repository });

    newsFeedStream.should.have.property('start');
    newsFeedStream.start.should.be.a('function');
  });

  it('deve conter o método "stop"', function() {
    var repository = createMockRepository();
    var newsFeedStream = createNewsFeedStream({ repository: repository });

    newsFeedStream.should.have.property('stop');
    newsFeedStream.start.should.be.a('function');
  });


  describe('#events', function() {
    var newsObjectTemplate1 = {
      "lastComment": "Exercitation aliquip deserunt aute proident est amet non.",
      "slug": "exercitation-aliquip-deserunt-aute-proident-est-amet-non",
      "title": "Exercitation aliquip deserunt aute proident est amet non.",
      "uuid": "d36fb8b2-a0e8-11e4-89d3-123b93f75cba",
      "xp": 100
    };

    it('deve conter a propriedade "on"', function() {
      var repository = createMockRepository();
      var newsFeedStream = createNewsFeedStream({ repository: repository });

      newsFeedStream.events.should.have.property('on');
    });

    it('deve conter a propriedade "emit"', function() {
      var repository = createMockRepository();
      var newsFeedStream = createNewsFeedStream({ repository: repository });

      newsFeedStream.events.should.have.property('emit');
    });

    it('"on" deve receber as mensagens enviadas por "emit"', function(done) {
      var repository = createMockRepository();
      var newsFeedStream = createNewsFeedStream({ repository: repository });

      newsFeedStream.events.on('onEmitTest', function onEmitTest(testArray) {
        testArray.should.be.a('array');
        done();
      });

      newsFeedStream.events.emit('onEmitTest', [1,2,3,4,5]);
    });

    it('deve emitir "news:added" ao receber nova notícia do repositório', function(done) {
      var repository = createMockRepository();
      var newsFeedStream = createNewsFeedStream({ repository: repository });

      newsFeedStream.events.on('news:added', function onNewsAdded(news) {
        news.should.be.a('object');
        news.should.be.deep.equal(newsObjectTemplate1);
        done();
      });

      repository.events.emit('news:added', newsObjectTemplate1);
    });

    it('deve atualizar a lista de notícias no evento "news:added"', function() {
      var repository = createMockRepository();
      var newsFeedStream = createNewsFeedStream({ repository: repository });

      chai.expect(newsFeedStream.getNewsList().length).to.be.equal(0);

      repository.events.emit('news:added', newsObjectTemplate1);

      chai.expect(newsFeedStream.getNewsList().length).to.be.equal(1);
    });

    it('deve emitir "newsList:updated" ao receber nova notícia do repositório', function(done) {
      var repository = createMockRepository();
      var newsFeedStream = createNewsFeedStream({ repository: repository });

      newsFeedStream.events.on('newsList:updated', function onNewsAdded(newsList) {
        newsList.should.be.a('array');
        done();
      });

      repository.events.emit('news:added', newsObjectTemplate1);
    });

    it('deve atualizar notícia na newsList ao receber "news:updated" do repositório', function(done) {
      var repository = createMockRepository();
      var newsFeedStream = createNewsFeedStream({ repository: repository });


      var newsObjectTemplate2 = {
        "lastComment": "Dolor anim eu velit fugiat irure sit.",
        "slug": "dolor-anim-eu-velit-fugiat-irure-sit",
        "title": "Dolor anim eu velit fugiat irure sit.",
        "uuid": "c4397bea-9f3e-11e4-89d3-123b93f75cba",
        "xp": 50
      };

      // Popula o model com duas notícias utilizando o repositório
      repository.events.emit('news:added', newsObjectTemplate1);
      repository.events.emit('news:added', newsObjectTemplate2);

      // Somente depois de popular o model vamos começar a escutar
      // o evento sobre a newsList ser atualizada, pois do contrário,
      // ele seria disparado duas vezes enquanto estávamos atualizando
      // o model anteriormente.
      newsFeedStream.events.on('newsList:updated', function newsListUpdated(newsList) {
        chai.expect(newsList.length).to.be.equal(2);

        var firstNews = newsFeedStream.find( { uuid: newsObjectTemplate1.uuid } );
        var modifiedNews = newsFeedStream.find( { uuid: newsObjectTemplate2.uuid } );

        chai.expect(firstNews.xp).to.be.equal(100);
        chai.expect(modifiedNews.xp).to.be.equal(150);
        done();

      });

      var newsObjectTemplate2Modified = {
        "lastComment": "Dolor anim eu velit fugiat irure sit.",
        "slug": "dolor-anim-eu-velit-fugiat-irure-sit",
        "title": "Dolor anim eu velit fugiat irure sit.",
        "uuid": "c4397bea-9f3e-11e4-89d3-123b93f75cba",
        "xp": 150
      };

      repository.events.emit('news:updated', newsObjectTemplate2Modified);



    });


  });


  describe('#start', function() {

    it('quando executado e repositório iniciar, deve emitir o evento "started"', function(done) {
      var repository = createMockRepository();
      var newsFeedStream = createNewsFeedStream({ repository: repository });

      newsFeedStream.events.on('started', function onStart() {
        done();
      });

      newsFeedStream.start();

    });


  });


  describe('#stop', function() {

    it('quando executado e repositório parar, deve emitir o evento "stopped"', function(done) {
      var repository = createMockRepository();
      var newsFeedStream = createNewsFeedStream({ repository: repository });

      newsFeedStream.events.on('stopped', function onStart() {
        done();
      });

      newsFeedStream.stop();

    });


  });
});
