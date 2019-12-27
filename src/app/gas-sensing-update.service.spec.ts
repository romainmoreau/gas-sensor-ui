import { GasSensingUpdateService } from './gas-sensing-update.service';

describe('GasSensingUpdateService', () => {
  let service: GasSensingUpdateService;
  beforeEach(() => { service = new GasSensingUpdateService(undefined); });
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
