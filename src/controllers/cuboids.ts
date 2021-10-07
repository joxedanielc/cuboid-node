import { Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import { Id } from 'objection';
import { Bag, Cuboid } from '../models';

export const list = async (req: Request, res: Response): Promise<Response> => {
  const ids = req.query.ids as Id[];
  const cuboids = await Cuboid.query().findByIds(ids).withGraphFetched('bag');

  return res.status(200).json(cuboids);
};

export const get = async (req: Request, res: Response): Promise<Response> => {
  
  const id: Id = req.params.id;
  const cuboid = await Cuboid.query().findById(id);

  if(!cuboid) {
    return res.sendStatus(HttpStatus.NOT_FOUND);
  }

  cuboid.volume = cuboid.depth * cuboid.width * cuboid.height;

  return res.status(HttpStatus.OK).json(cuboid);
}

export const create = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { width, height, depth, bagId } = req.body;

  const bag = await Bag.query().findById(bagId).withGraphFetched('cuboids');

  if(!bag) {
    return res.sendStatus(HttpStatus.NOT_FOUND);
  }

  let iCuboidsVolume = 0;

  bag?.cuboids?.forEach(function(element) {
    iCuboidsVolume+= element.depth * element.height * element.width;
  });

  let iNewCuboidVolume = depth * height * width;

  iCuboidsVolume+= iNewCuboidVolume;

  if(iCuboidsVolume > bag.volume) {
    return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({message: 'Insufficient capacity in bag'});
  }

  const cuboid = await Cuboid.query().insert({
    width,
    height,
    depth,
    bagId,
  });

  return res.status(HttpStatus.CREATED).json(cuboid);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {

  const { width, height, depth } = req.body;
  //console.log(req.body);
  
  const cid: Id = req.params.id;
  //console.log({cid});

  const oCuboids = await Cuboid.query().findById(cid).withGraphFetched('bag');

  if(!oCuboids) {
    return res.sendStatus(HttpStatus.NOT_FOUND);
  }

  const bag = await Bag.query().findById(oCuboids.bag.id).withGraphFetched('cuboids');

  if(!bag) {
    return res.sendStatus(HttpStatus.NOT_FOUND);
  }

  let iCuboidsVolume = 0;

  bag?.cuboids?.forEach(function(element) {
    iCuboidsVolume+= element.depth * element.height * element.width;
  });

  let iNewCuboidVolume = depth * height * width;

  iCuboidsVolume+= iNewCuboidVolume;

  if(iCuboidsVolume > bag.volume) {
    return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({width, height, depth});
  }

  const cuboid = await Cuboid.query().findById(cid).patch({
    width, height, depth
  });

  return res.status(HttpStatus.OK).json(cuboid);
}

export const deleteC = async (
  req: Request,
  res: Response
): Promise<Response> => {

  const cid: Id = req.params.id;
  //console.log({cid});

  const cuboidToBeDelete = await Cuboid.query().findById(cid);

  if(!cuboidToBeDelete) {
    return res.status(HttpStatus.NOT_FOUND).json(cid);
  }

  const cuboidGone = await Cuboid.query().deleteById(cid);
  
  return res.status(HttpStatus.OK).json(cid);
}
