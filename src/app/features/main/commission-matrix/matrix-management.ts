import { ROUTING_PATH } from "@config/routingPath.config";

/**
 * settings and masters list
 */
export interface MatrixManagementType {
  title: string;
  target: string;
  items: {
    title: string;
    target: string;
    authkey: string;
  }[];
}

export let MatrixManagementMenu: MatrixManagementType[] = [
  {
    title: 'Payout Matrix',
    target: '',
    items: [
      {
        title: 'Upload Matrix - (Std)',
        target: ROUTING_PATH.CommissionMatrix.CommissionCalculationMatrixModuleList,
        authkey: "CommissionCalMatrix-list",
      },
      {
        title: 'Upload Matrix - (Slab Wise)',
        target: ROUTING_PATH.SlabCommissionMatrix.CommissionCalculationMatrixModuleList,
        authkey: "CommissionCalMatrix-list",
      },
      {
        title: 'Recalculate Commission',
        target: ROUTING_PATH.CommissionMatrix.CommissionCalculationMatrixRecalculat,
        authkey: "CommissionCalMatrix-list",
      }
    ],
  }
];
