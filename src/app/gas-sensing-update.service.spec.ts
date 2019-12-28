import { GasSensingUpdateService } from './gas-sensing-update.service';

describe('GasSensingUpdateService', () => {
  let service: GasSensingUpdateService;
  beforeEach(() => { service = new GasSensingUpdateService(undefined); });
  describe('addOrUpdatePoint', () => {
    it('should work as expected #1', () => {
      const point: [number, number] = [0, 1];
      const data: [number, number][] = [];
      service.addOrUpdatePoint(point, data, true);
      expect(data).toEqual([[0, 1]]);
    });
    it('should work as expected #2', () => {
      const point: [number, number] = [0, 1];
      const data: [number, number][] = [];
      service.addOrUpdatePoint(point, data, false);
      expect(data).toEqual([]);
    });
    it('should work as expected #3', () => {
      const point: [number, number] = [0, 1];
      const data: [number, number][] = [[1, 2]];
      service.addOrUpdatePoint(point, data, true);
      expect(data).toEqual([[0, 1], [1, 2]]);
    });
    it('should work as expected #4', () => {
      const point: [number, number] = [0, 1];
      const data: [number, number][] = [[1, 2]];
      service.addOrUpdatePoint(point, data, false);
      expect(data).toEqual([[1, 2]]);
    });
    it('should work as expected #5', () => {
      const point: [number, number] = [1, 3];
      const data: [number, number][] = [[1, 2]];
      service.addOrUpdatePoint(point, data, true);
      expect(data).toEqual([[1, 3]]);
    });
    it('should work as expected #6', () => {
      const point: [number, number] = [1, 3];
      const data: [number, number][] = [[1, 2]];
      service.addOrUpdatePoint(point, data, false);
      expect(data).toEqual([[1, 2]]);
    });
    it('should work as expected #7', () => {
      const point: [number, number] = [2, 3];
      const data: [number, number][] = [[1, 2]];
      service.addOrUpdatePoint(point, data, true);
      expect(data).toEqual([[1, 2], [2, 3]]);
    });
    it('should work as expected #8', () => {
      const point: [number, number] = [2, 3];
      const data: [number, number][] = [[1, 2]];
      service.addOrUpdatePoint(point, data, false);
      expect(data).toEqual([[1, 2], [2, 2]]);
    });
    it('should work as expected #9', () => {
      const point: [number, number] = [5, 0];
      const data: [number, number][] = [[2, 1], [4, 3]];
      service.addOrUpdatePoint(point, data, true);
      expect(data).toEqual([[2, 1], [4, 3], [5, 0]]);
    });
    it('should work as expected #10', () => {
      const point: [number, number] = [5, 0];
      const data: [number, number][] = [[2, 1], [4, 3]];
      service.addOrUpdatePoint(point, data, false);
      expect(data).toEqual([[2, 1], [4, 3], [5, 3]]);
    });
    it('should work as expected #11', () => {
      const point: [number, number] = [4, 0];
      const data: [number, number][] = [[2, 1], [4, 3]];
      service.addOrUpdatePoint(point, data, true);
      expect(data).toEqual([[2, 1], [4, 0]]);
    });
    it('should work as expected #12', () => {
      const point: [number, number] = [4, 0];
      const data: [number, number][] = [[2, 1], [4, 3]];
      service.addOrUpdatePoint(point, data, false);
      expect(data).toEqual([[2, 1], [4, 3]]);
    });
    it('should work as expected #13', () => {
      const point: [number, number] = [3, 0];
      const data: [number, number][] = [[2, 1], [4, 3]];
      service.addOrUpdatePoint(point, data, true);
      expect(data).toEqual([[2, 1], [3, 0], [4, 3]]);
    });
    it('should work as expected #14', () => {
      const point: [number, number] = [3, 0];
      const data: [number, number][] = [[2, 1], [4, 3]];
      service.addOrUpdatePoint(point, data, false);
      expect(data).toEqual([[2, 1], [3, 1], [4, 3]]);
    });
    it('should work as expected #15', () => {
      const point: [number, number] = [1, 0];
      const data: [number, number][] = [[2, 1], [4, 3]];
      service.addOrUpdatePoint(point, data, true);
      expect(data).toEqual([[1, 0], [2, 1], [4, 3]]);
    });
    it('should work as expected #16', () => {
      const point: [number, number] = [1, 0];
      const data: [number, number][] = [[2, 1], [4, 3]];
      service.addOrUpdatePoint(point, data, false);
      expect(data).toEqual([[2, 1], [4, 3]]);
    });
  });
  describe('normalizeDatas', () => {
    it('should work as expected #1', () => {
      const datas: [number, number][][] = [];
      const normalizedDatas = service.normalizeDatas(datas);
      expect(normalizedDatas.length).toBe(datas.length);
    });
    it('should work as expected #2', () => {
      const datas: [number, number][][] = [[]];
      const normalizedDatas = service.normalizeDatas(datas);
      expect(normalizedDatas.length).toBe(datas.length);
    });
    it('should work as expected #3', () => {
      const datas: [number, number][][] = [[], []];
      const normalizedDatas = service.normalizeDatas(datas);
      expect(normalizedDatas.length).toBe(datas.length);
    });
    it('should work as expected #4', () => {
      const datas: [number, number][][] = [[[0, 1]]];
      const normalizedDatas = service.normalizeDatas(datas);
      expect(normalizedDatas.length).toBe(datas.length);
      expect(normalizedDatas).toEqual(datas);
    });
    it('should work as expected #5', () => {
      const datas: [number, number][][] = [[[0, 1]], []];
      const normalizedDatas = service.normalizeDatas(datas);
      expect(normalizedDatas.length).toBe(datas.length);
      expect(normalizedDatas).toEqual(datas);
    });
    it('should work as expected #6', () => {
      const datas: [number, number][][] = [[], [[0, 1]]];
      const normalizedDatas = service.normalizeDatas(datas);
      expect(normalizedDatas.length).toBe(datas.length);
      expect(normalizedDatas).toEqual(datas);
    });
    it('should work as expected #7', () => {
      const datas: [number, number][][] = [[[1, 2]], [[0, 1]]];
      const normalizedDatas = service.normalizeDatas(datas);
      expect(normalizedDatas.length).toBe(datas.length);
      expect(normalizedDatas).toEqual([[[1, 2]], [[0, 1], [1, 1]]]);
    });
    it('should work as expected #8', () => {
      const datas: [number, number][][] = [[[0, 2]], [[1, 1]]];
      const normalizedDatas = service.normalizeDatas(datas);
      expect(normalizedDatas.length).toBe(datas.length);
      expect(normalizedDatas).toEqual([[[0, 2], [1, 2]], [[1, 1]]]);
    });
    it('should work as expected #9', () => {
      const datas: [number, number][][] = [[[0, 2], [1, 3]], [[1, 1]]];
      const normalizedDatas = service.normalizeDatas(datas);
      expect(normalizedDatas.length).toBe(datas.length);
      expect(normalizedDatas).toEqual([[[0, 2], [1, 3]], [[1, 1]]]);
    });
    it('should work as expected #10', () => {
      const datas: [number, number][][] = [[[0, 2]], [[0, 3], [1, 1]]];
      const normalizedDatas = service.normalizeDatas(datas);
      expect(normalizedDatas.length).toBe(datas.length);
      expect(normalizedDatas).toEqual([[[0, 2], [1, 2]], [[0, 3], [1, 1]]]);
    });
    it('should work as expected #11', () => {
      const datas: [number, number][][] = [[[0, 2], [2, 1]], [[1, 3], [3, 4]]];
      const normalizedDatas = service.normalizeDatas(datas);
      expect(normalizedDatas.length).toBe(datas.length);
      expect(normalizedDatas).toEqual([[[0, 2], [1, 2], [2, 1], [3, 1]], [[1, 3], [2, 3], [3, 4]]]);
    });
    it('should work as expected #12', () => {
      const datas: [number, number][][] = [[[1, 2], [3, 1]], [[0, 3], [2, 4]]];
      const normalizedDatas = service.normalizeDatas(datas);
      expect(normalizedDatas.length).toBe(datas.length);
      expect(normalizedDatas).toEqual([[[1, 2], [2, 2], [3, 1]], [[0, 3], [1, 3], [2, 4], [3, 4]]]);
    });
  });
});
