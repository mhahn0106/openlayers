import _ol_events_ from '../../../src/ol/events.js';
import Collection from '../../../src/ol/Collection.js';
import CollectionEventType from '../../../src/ol/CollectionEventType.js';


describe('ol.collection', function() {
  let collection;

  beforeEach(function() {
    collection = new Collection();
  });

  describe('create an empty collection', function() {
    it('creates an empty collection', function() {
      expect(collection.getLength()).to.eql(0);
      expect(collection.getArray()).to.be.empty();
      expect(collection.item(0)).to.be(undefined);
    });
  });

  describe('create a collection from an array', function() {
    it('creates the expected collection', function() {
      const array = [0, 1, 2];
      const collection = new Collection(array);
      expect(collection.item(0)).to.eql(0);
      expect(collection.item(1)).to.eql(1);
      expect(collection.item(2)).to.eql(2);
    });
  });

  describe('push to a collection', function() {
    it('adds elements to the collection', function() {
      const length = collection.push(1);
      expect(collection.getLength()).to.eql(length);
      expect(collection.getArray()).to.eql([1]);
      expect(collection.item(0)).to.eql(1);
    });
    it('returns the correct new length of the collection', function() {
      let length;
      _ol_events_.listen(collection, 'add', function(event) {
        if (event.element === 'remove_me') {
          collection.remove(event.element);
        }
      });
      length = collection.push('keep_me');
      expect(collection.getLength()).to.eql(length);
      length = collection.push('remove_me');
      expect(collection.getLength()).to.eql(length);
    });
  });

  describe('pop from a collection', function() {
    it('removes elements from the collection', function() {
      collection.push(1);
      collection.pop();
      expect(collection.getLength()).to.eql(0);
      expect(collection.getArray()).to.be.empty();
      expect(collection.item(0)).to.be(undefined);
    });
  });

  describe('insertAt', function() {
    it('inserts elements at the correct location', function() {
      collection = new Collection([0, 2]);
      collection.insertAt(1, 1);
      expect(collection.item(0)).to.eql(0);
      expect(collection.item(1)).to.eql(1);
      expect(collection.item(2)).to.eql(2);
    });
  });

  describe('setAt', function() {
    it('sets at the correct location', function() {
      collection.setAt(1, 1);
      expect(collection.getLength()).to.eql(2);
      expect(collection.item(0)).to.be(undefined);
      expect(collection.item(1)).to.eql(1);
    });
  });

  describe('removeAt', function() {
    it('removes elements at the correction', function() {
      const collection = new Collection([0, 1, 2]);
      collection.removeAt(1);
      expect(collection.item(0)).to.eql(0);
      expect(collection.item(1)).to.eql(2);
    });
  });

  describe('forEach', function() {
    let cb;
    beforeEach(function() {
      cb = sinon.spy();
    });
    describe('on an empty collection', function() {
      it('does not call the callback', function() {
        collection.forEach(cb);
        expect(cb).to.not.be.called();
      });
    });
    describe('on a non-empty collection', function() {
      it('does call the callback', function() {
        collection.push(1);
        collection.push(2);
        collection.forEach(cb);
        expect(cb.callCount).to.eql(2);
      });
    });
  });

  describe('remove', function() {
    it('removes the first matching element', function() {
      const collection = new Collection([0, 1, 2]);
      expect(collection.remove(1)).to.eql(1);
      expect(collection.getArray()).to.eql([0, 2]);
      expect(collection.getLength()).to.eql(2);
    });
    it('fires a remove event', function() {
      const collection = new Collection([0, 1, 2]);
      const cb = sinon.spy();
      _ol_events_.listen(collection, CollectionEventType.REMOVE, cb);
      expect(collection.remove(1)).to.eql(1);
      expect(cb).to.be.called();
      expect(cb.lastCall.args[0].element).to.eql(1);
    });
    it('does not remove more than one matching element', function() {
      const collection = new Collection([0, 1, 1, 2]);
      expect(collection.remove(1)).to.eql(1);
      expect(collection.getArray()).to.eql([0, 1, 2]);
      expect(collection.getLength()).to.eql(3);
    });
    it('returns undefined if the element is not found', function() {
      const collection = new Collection([0, 1, 2]);
      expect(collection.remove(3)).to.be(undefined);
      expect(collection.getArray()).to.eql([0, 1, 2]);
      expect(collection.getLength()).to.eql(3);
    });
  });

  describe('setAt and event', function() {
    it('does dispatch events', function() {
      const collection = new Collection(['a', 'b']);
      let added, removed;
      _ol_events_.listen(collection, CollectionEventType.ADD, function(e) {
        added = e.element;
      });
      _ol_events_.listen(
        collection, CollectionEventType.REMOVE, function(e) {
          removed = e.element;
        });
      collection.setAt(1, 1);
      expect(added).to.eql(1);
      expect(removed).to.eql('b');
    });
  });

  describe('removeAt and event', function() {
    it('does dispatch events', function() {
      const collection = new Collection(['a']);
      let removed;
      _ol_events_.listen(
        collection, CollectionEventType.REMOVE, function(e) {
          removed = e.element;
        });
      collection.pop();
      expect(removed).to.eql('a');
    });
  });

  describe('insertAt and event', function() {
    it('does dispatch events', function() {
      const collection = new Collection([0, 2]);
      let added;
      _ol_events_.listen(
        collection, CollectionEventType.ADD, function(e) {
          added = e.element;
        });
      collection.insertAt(1, 1);
      expect(added).to.eql(1);
    });
  });

  describe('setAt beyond end', function() {
    it('triggers events properly', function() {
      const added = [];
      _ol_events_.listen(
        collection, CollectionEventType.ADD, function(e) {
          added.push(e.element);
        });
      collection.setAt(2, 0);
      expect(collection.getLength()).to.eql(3);
      expect(collection.item(0)).to.be(undefined);
      expect(collection.item(1)).to.be(undefined);
      expect(collection.item(2)).to.eql(0);
      expect(added.length).to.eql(3);
      expect(added[0]).to.eql(undefined);
      expect(added[1]).to.eql(undefined);
      expect(added[2]).to.eql(0);
    });
  });

  describe('change:length event', function() {
    let collection, cb;
    beforeEach(function() {
      collection = new Collection([0, 1, 2]);
      cb = sinon.spy();
      _ol_events_.listen(collection, 'change:length', cb);
    });

    describe('insertAt', function() {
      it('triggers change:length event', function() {
        collection.insertAt(2, 3);
        expect(cb).to.be.called();
      });
    });

    describe('removeAt', function() {
      it('triggers change:length event', function() {
        collection.removeAt(0);
        expect(cb).to.be.called();
      });
    });

    describe('setAt', function() {
      it('does not trigger change:length event', function() {
        collection.setAt(1, 1);
        expect(cb).to.not.be.called();
      });
    });
  });

  describe('add event', function() {
    it('triggers add when pushing', function() {
      const collection = new Collection();
      let elem;
      _ol_events_.listen(collection, CollectionEventType.ADD, function(e) {
        elem = e.element;
      });
      const length = collection.push(1);
      expect(elem).to.eql(length);
    });
  });

  describe('remove event', function() {
    let collection, cb1, cb2;
    beforeEach(function() {
      collection = new Collection([1]);
      cb1 = sinon.spy();
      cb2 = sinon.spy();
    });
    describe('setAt', function() {
      it('triggers remove', function() {
        _ol_events_.listen(collection, CollectionEventType.ADD, cb1);
        _ol_events_.listen(collection, CollectionEventType.REMOVE, cb2);
        collection.setAt(0, 2);
        expect(cb2.lastCall.args[0].element).to.eql(1);
        expect(cb1.lastCall.args[0].element).to.eql(2);
      });
    });
    describe('pop', function() {
      it('triggers remove', function() {
        _ol_events_.listen(collection, CollectionEventType.REMOVE, cb1);
        collection.pop();
        expect(cb1.lastCall.args[0].element).to.eql(1);
      });
    });
  });

  describe('extending a collection', function() {
    it('adds elements to end of the collection', function() {
      collection.extend([1, 2]);
      expect(collection.getLength()).to.eql(2);
      expect(collection.getArray()).to.eql([1, 2]);
      expect(collection.item(0)).to.eql(1);
      expect(collection.item(1)).to.eql(2);
    });
    it('fires events', function() {
      const collection = new Collection();
      const elems = [];
      _ol_events_.listen(collection, CollectionEventType.ADD, function(e) {
        elems.push(e.element);
      });
      collection.extend([1, 2]);
      expect(elems).to.eql([1, 2]);
    });
  });

  describe('unique collection', function() {
    it('allows unique items in the constructor', function() {
      new Collection([{}, {}, {}], {unique: true});
    });

    it('throws if duplicate items are passed to the constructor', function() {
      const item = {};
      const call = function() {
        new Collection([item, item], {unique: true});
      };
      expect(call).to.throwException();
    });

    it('allows unique items to be added via push', function() {
      const unique = new Collection(undefined, {unique: true});
      unique.push({});
      unique.push({});
    });

    it('throws if duplicate items are added via push', function() {
      const unique = new Collection(undefined, {unique: true});
      const item = {};
      unique.push(item);
      const call = function() {
        unique.push(item);
      };
      expect(call).to.throwException();
    });

    it('allows unique items to be added via insertAt', function() {
      const unique = new Collection(undefined, {unique: true});
      unique.insertAt(0, {});
      unique.insertAt(0, {});
    });

    it('throws if duplicate items are added via insertAt', function() {
      const unique = new Collection(undefined, {unique: true});
      const item = {};
      unique.insertAt(0, item);
      const call = function() {
        unique.insertAt(0, item);
      };
      expect(call).to.throwException();
    });

    it('allows unique items to be added via setAt', function() {
      const unique = new Collection(undefined, {unique: true});
      unique.setAt(0, {});
      unique.setAt(1, {});
    });

    it('allows items to be reset via setAt', function() {
      const unique = new Collection(undefined, {unique: true});
      const item = {};
      unique.setAt(0, item);
      unique.setAt(0, item);
    });

    it('throws if duplicate items are added via setAt', function() {
      const unique = new Collection(undefined, {unique: true});
      const item = {};
      unique.setAt(0, item);
      const call = function() {
        unique.setAt(1, item);
      };
      expect(call).to.throwException();
    });

  });

});
