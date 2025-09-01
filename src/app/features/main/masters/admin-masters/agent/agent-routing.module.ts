import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgentListComponent } from './agent-list/agent-list.component';
import { AgentComponent } from './agent/agent.component';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { RoleGuard } from 'src/app/shared/guards/role.guard';
import { CustomResolverService } from '@lib/services/http/custom-resolver.service';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: AgentListComponent,
    data: { title: "Agent", authKey: "Agent-list" },
    canActivate: [RoleGuard]
  },
  {
    path: 'create',
    component: AgentComponent,
    data: { title: "Add Agent", mode: "Create", authKey: "Agent-create" },
    canActivate: [RoleGuard]
  },
  {
    path: 'view/:Id',
    component: AgentComponent,
    data: { title: "View Agent", apiEndPoint: API_ENDPOINTS.Agent.Base, mode: "View", authKey: "Agent-get" }, resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'edit/:Id',
    component: AgentComponent,
    data: { title: "Edit Agent", apiEndPoint: API_ENDPOINTS.Agent.Base, mode: "Edit", authKey: "Agent-update" }, resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'becomeAPOSP/:Id',
    component: AgentComponent,
    data: { title: "Convert Agent", apiEndPoint: API_ENDPOINTS.PoSPOnBoarding.ConvertAgent, mode: "ConvertAgent", authKey: "Agent-get" }, resolve: { data: CustomResolverService },
    canActivate: [RoleGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgentRoutingModule { }
