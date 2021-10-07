import { Id, RelationMappings } from 'objection';
import { Cuboid } from './Cuboid';
import Base from './Base';

export class Bag extends Base {
  id!: Id;
  volume!: number;
  title!: string;
  payloadVolume!: number;
  availableVolume!: number;
  cuboids?: Cuboid[] | undefined;

  static tableName = 'bags';

  $afterFind() {
    let iVolume = 0;

    if(this.cuboids && this.cuboids.length > 0) {
      this.cuboids.forEach(function(element) {
        iVolume+= element.depth * element.height * element.width;
        //iVolume+= element.volume
      });
    }

    this.payloadVolume = iVolume;
    this.availableVolume = this.volume - this.payloadVolume;
  }

  static get relationMappings(): RelationMappings {
    return {
      cuboids: {
        relation: Base.HasManyRelation,
        modelClass: 'Cuboid',
        join: {
          from: 'bags.id',
          to: 'cuboids.bagId',
        },
      },
    };
  }
}

export default Bag;
