import React from 'react';
// import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import Bridge from '../tools/bridge';
import Genid from '../tools/genid';
import Form from '../components/form';
import { FaPen, FaTrash } from 'react-icons/fa';
import { useTable } from 'react-table';
import FormFields from '../components/formFields';
import Filter from '../components/filter';

type queryT = {
  status: string;
  isLoading: boolean;
  data: { [key: string]: any };
  refetch: () => void;
};
type propsT = { portfoliosListQuery: queryT; projectsListQuery: queryT };

const AfterQueryPrep = (props: propsT) => {
  const [state, setState] = React.useState({
    popup: { form: { show: false, mode: 'create', itemID: '' } },
  });
  const stateActions = {
    form: {
      show: (itemID?: string, mode?: 'edit' | 'create') => {
        const stateCpy = { ...state }; // tricking react with a shallow copy

        if (mode == 'edit') {
          if (!itemID) {
            return console.log(
              'err: forgot to include the item id for editing'
            );
          }
          stateCpy.popup.form.mode = mode;
          stateCpy.popup.form.itemID = itemID;
        }

        stateCpy.popup.form.show = true;
        setState(stateCpy);
      },
      hide: () => {
        const stateCpy = { ...state }; // tricking react with a shallow copy
        stateCpy.popup.form.show = false;
        setState(stateCpy);
      },
    },
  };

  const portfolio_fkSelectRef = React.useRef<HTMLSelectElement | null>(null);
  const project_fkSelectRef = React.useRef<HTMLSelectElement | null>(null);
  const formFieldsRef = React.useRef<{} | null>(null);

  // TODO: extract this to a seperate component
  const tasksQuery = useQuery('projects', async () => {
    const response = await Bridge(
      'read',
      `project/all?portfolio_fk=${
        portfolio_fkSelectRef.current?.value ??
        props.portfoliosListQuery.data[0]
      }&project_fk=${
        project_fkSelectRef.current?.value ?? props.projectsListQuery.data[0]
      }`
    );
    return response?.err == 'serverError' ? false : response.data;
  });
  // if (projectsQuery.status == 'success') {
  //   console.log(projectsQuery.data);
  // }

  const tailwindClx = {
    projectBorder: 'border-2 border-primary rounded-md',
    projectItem: `flex items-center justify-center w-[12rem]
                  h-[7rem] text-primary text-2xl`,
  };

  const createNewProject = () => {
    formFieldsRef.current = FormFields('project', {
      portfolio_fk: {
        props: {
          defaultValue: portfolio_fkSelectRef.current?.value,
          readOnly: true,
        },
      },
      project_fk: {
        props: {
          defaultValue: project_fkSelectRef.current?.value,
          readOnly: true,
        },
      },
      title: 'default',
      description: 'default',
      bgColor: 'default',
      dueDate: 'default',
      status: 'default',
      milestone: 'default',
      budget: 'default',
      expense: 'default',
    });

    stateActions.form.show();
  };

  const editProject = (project: { [key: string]: any }) => {
    formFieldsRef.current = FormFields('project', {
      portfolio_fk: {
        props: {
          defaultValue: portfolio_fkSelectRef.current?.value,
          readOnly: true,
        },
      },
      project_fk: {
        props: {
          defaultValue: project_fkSelectRef.current?.value,
          readOnly: true,
        },
      },
      title: { props: { defaultValue: project.title } },
      description: { props: { defaultValue: project.description } },
      bgColor: { props: { defaultValue: project.bgColor } },
      dueDate: { props: { defaultValue: project.dueDate } },
      status: { props: { defaultValue: project.status } },
      milestone: { props: { defaultValue: project.milestone } },
      budget: { props: { defaultValue: project.budget } },
      expense: { props: { defaultValue: project.expense } },
    });

    stateActions.form.show(project.id, 'edit');
  };

  const removeProject = async (id: string) => {
    const resp = await Bridge('remove', `project`, {
      id,
    });

    if (resp.err) {
      console.log(resp);
      return;
    }

    tasksQuery.refetch();
  };

  // TODO: set default selected item to the last visited one
  return (
    <div aria-label='container' className={`grow flex flex-col`}>
      {/*
        <Filter fields={formFieldsRef} />
      */}
      <main
        aria-label='projects'
        className='text-black mt-[7rem] px-10 gap-6 grow flex flex-col items-center'
      >
        <select
          ref={portfolio_fkSelectRef}
          onChange={tasksQuery.refetch}
          className={`w-max`}
        >
          {props.portfoliosListQuery.data.map(
            (portfolio: { id: string; title: string }) => (
              <option value={portfolio.id}>{portfolio.title}</option>
            )
          )}
        </select>
        <select
          ref={project_fkSelectRef}
          onChange={tasksQuery.refetch}
          className={`w-max`}
        >
          {props.projectsListQuery.data.map(
            (project: { id: string; title: string }) => (
              <option value={project.id}>{project.title}</option>
            )
          )}
        </select>

        {/* new project button*/}
        <button
          onClick={createNewProject}
          className={`${tailwindClx.projectBorder} w-max px-3 py-1 text-primary text-lg capitalize`}
        >
          <span className='text-2xl'>+</span> add new project
        </button>

        {state.popup.form.show ? (
          <Form
            fields={formFieldsRef.current}
            mode={state.popup.form.mode}
            itemID={state.popup.form.itemID}
            route={'project'}
            refetch={tasksQuery.refetch}
            hideForm={stateActions.form.hide}
          />
        ) : (
          <></>
        )}
      </main>
    </div>
  );
};

// react/re-render is making it hard that is why I need to split dependent react-query calls
export default function Projects() {
  const portfoliosListQuery = useQuery('portfolio list', async () => {
    const response = await Bridge('read', `portfolio/list`);
    return response?.err == 'serverError' ? false : response.data;
  });

  const projectsListQuery = useQuery('project list', async () => {
    const response = await Bridge('read', `project/list`);
    return response?.err == 'serverError' ? false : response.data;
  });

  console.log(portfoliosListQuery.status == 'success');
  console.log(projectsListQuery.status == 'success');

  if (
    portfoliosListQuery.status == 'success' &&
    projectsListQuery.status == 'success'
  )
    return (
      <AfterQueryPrep
        portfoliosListQuery={portfoliosListQuery}
        projectsListQuery={projectsListQuery}
      />
    );

  return <></>;
}
