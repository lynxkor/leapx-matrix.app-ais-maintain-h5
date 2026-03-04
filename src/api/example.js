import { post } from '../libs/utils/request'

export function getList(data) {
  return post('/datacenter/vehiclePartsMaintenance/page', data)
}
