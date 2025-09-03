'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Input, Select, Table, message, Radio } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
    createCampaign,
    setCurrentCampaign,
    fetchFiliais,
    fetchOperators,
    fetchProductsByType,
    fetchMarcasByType,
    fetchVendors,
} from '@/hooks/slices/trade/tradeSlice';
import { AppDispatch, RootState } from '@/hooks/store';
import { debounce } from 'lodash';
import { MetaTable } from '@/components/trade/meta-table';
import { formatDateUTC } from '@/lib/utils';

import { IFilial } from '@/types/noPaper/Supplier/SupplierType';
import { Operador } from '@/types/Trade/IOperator';
import { Escala, IEscala } from '@/types/Trade/IEscala';
import { ICampaign } from '@/types/Trade/ICampaign';
import { IProduct } from '@/types/Trade/IProduct';
import { IParticipants } from '@/types/Trade/IParticipants';
import { Label } from '@radix-ui/react-label';
import * as XLSX from 'xlsx'

const { Option } = Select;

export default function CampaignRegistration() {
    const dispatch = useDispatch<AppDispatch>();

    const { currentCampaign, operators, filiais, products, marcas, vendors} = useSelector(
        (state: RootState) => state.trade
    );
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [operadores, setOperadores] = useState<Operador[]>([]);

    const [marcaProdutos, setMarcaProdutos] = useState<
        Array<{ nome: string; codprod: string; descricao: string }>
    >([]);
    const [tipoOperador, setTipoOperador] = useState('teleoperador');
    const [tipoMarcaProduto, setTipoMarcaProduto] = useState('marca');
    const [productName, setProductName] = useState('');
    const [selectedOperador, setSelectedOperador] = useState('');
    const [premiacao, setPremiacao] = useState('');
    const [campaignName, setCampaignName] = useState('');
    const [idempresa, setIdempresa] = useState('');
    const [tipoMeta, setTipoMeta] = useState('VALOR');
    const [meta_valor, setMetaValor] = useState('');
    const user = useSelector((state: RootState) => state.auth.user);
    const [escalaData, setEscalaData] = useState<Escala[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    /*const [editingParticipant, setEditingParticipant] =
            useState<IParticipants | null>(null);*/
    const [jsonExcelRCA, setJsonExcelRCA] = useState([])
    const [jsonExcelMarca, setJsonExcelMarca] = useState([])
    const [jsonExcelProduto, setJsonExcelProduto] = useState([])

    const [filename, setFileName] = useState()
    const [control, setControl] = useState(false)
    const [control2, setControl2] = useState(false)


    useEffect(() => {
        dispatch(fetchFiliais());
    }, [productName]);

    useEffect(() => {
        console.log("Operador Vendedor")
        if (tipoOperador == 'teleoperador') {
            //dispatch(fetchOperators({ busca: ' ', type: 'operador' }))
        } else {
            if (control == false) {
                //dispatch(fetchVendors({ busca: ' ', type: 'vendedor' }))
                /*.unwrap().then(() => {
                    jsonExcelRCA.forEach((item: any) => {
                        handleExcelRCA(item);
                    });
                })*/
            }
        }
    }, [tipoOperador])

    useEffect(() => {
        console.log("Produto Marca")
        if (tipoMarcaProduto == 'marca') {
            //if (control2 == false)
                //dispatch(fetchMarcasByType({ busca: ' ', type: 'marca' }))
                //dispatch(fetchProductsByType({ busca: ' ', type: 'marca' }))
        } else {
            //if (control2 == false)
                //dispatch(fetchProductsByType({ busca: ' ', type: 'produto' }))
        }
        console.log(products)
    }, [tipoMarcaProduto])

    useEffect(() => {
        console.log("First Load")
        dispatch(fetchOperators({ busca: ' ', type: 'operador' }))
        dispatch(fetchProductsByType({ busca: ' ', type: 'produto' }))
        dispatch(fetchMarcasByType({ busca: ' ', type: 'marca' }))
        dispatch(fetchVendors({ busca: ' ', type: 'vendedor' }))
    }, [])

    const handleAddOperador = () => {
        if (selectedOperador && meta_valor && premiacao) {
            const idparticipante =
                tipoOperador === 'teleoperador'
                    ? operators?.find(
                        (op: Operador) => op.nome === selectedOperador
                    )?.matricula
                    : operators?.find(
                        (op: Operador) => op.nome === selectedOperador
                    )?.codusur;

            if (!idparticipante) {
                message.error('Operador não encontrado!');
                return;
            }

            const participante = {
                modelo:
                    tipoOperador === 'teleoperador' ? 'teleoperador' : 'RCA',
                meta: tipoMeta,
                idparticipante,
                meta_valor: tipoMeta === 'VALOR' ? parseFloat(meta_valor.replace(/\s/g, '').replace('R$', '').replace(/\./g, '').replace(',', '.')) : 0,
                meta_quantidade: tipoMeta === 'QUANTIDADE' ? parseFloat(meta_valor.replace(/\s/g, '').replace('R$', '').replace(/\./g, '').replace(',', '.')) : 0,
                premiacao: premiacao.replace(/\s/g, '').replace('R$', '').replace(/\./g, '').replace(',', '.'),
                tipo_meta: tipoMeta,
            };

            console.log(participante)

            setOperadores([
                ...operadores,
                {
                    ...participante,
                    nome: selectedOperador,
                    tipo: tipoOperador,
                    matricula: idparticipante,
                    codusur: idparticipante,
                },
            ]);
            setSelectedOperador('');
            setMetaValor('');
            setPremiacao('');
        } else {
            message.error('Preencha todos os campos antes de adicionar!');
        }
    };

    const handleAddMarcaProduto = (
        nome: string,
        codprod: string,
        descricao: string
    ) => {
        console.log(nome)
        if (nome) {
            setMarcaProdutos([...marcaProdutos, { nome, codprod, descricao }]);
            setProductName(nome || '');
        } else {
            message.error('Preencha o nome antes de adicionar!');
        }
    };

    const handleRemoveOperador = (index: number) => {
        setOperadores(
            operadores.filter((_: Operador, i: number) => i !== index)
        );
    };

    const handleRemoveMarcaProduto = (index: number) => {
        setMarcaProdutos(
            marcaProdutos.filter(
                (
                    _: { nome: string; codprod: string; descricao: string },
                    i: number
                ) => i !== index
            )
        );
    };

    const handleSearchOperador = (searchTerm: string) => {
        if (searchTerm) {
            const type =
                tipoOperador === 'teleoperador' ? 'operador' : 'vendedor';

                if(type == 'operador')
                    dispatch(fetchOperators({ busca: searchTerm, type }));
                else
                    dispatch(fetchVendors({ busca: searchTerm, type }));

        } else {
            message.error('Digite o nome para buscar!');
        }
    };
    const handleSearchProduto = useCallback(
        debounce((searchTerm: string) => {
            if (searchTerm) {
                const type =
                    tipoMarcaProduto === 'produto' ? 'produto' : 'marca';
                if(type == 'produto')
                    dispatch(fetchProductsByType({ busca: searchTerm, type }));
                else
                    dispatch(fetchMarcasByType({ busca: searchTerm, type }));

            } else {
                message.error('Digite o nome para buscar!');
            }
        }, 300),
        [dispatch, tipoMarcaProduto]
    );

    const handleEscalaSubmit = (formattedMetas: Escala[]) => {
        setEscalaData(formattedMetas as unknown as Escala[]);
    };

    const handleSaveCampaign = async () => {
        const campaignData = {
            nome: campaignName,
            idempresa,
            datainicial: formatDateUTC(currentCampaign?.datainicial || ''),
            datafinal: formatDateUTC(currentCampaign?.datafinal || ''),
            valor_total: currentCampaign?.valor_total,
            userlanc: user?.username,
            datalanc: formatDate(new Date().toISOString()),
            status: true,
            participantes: operadores.map((op: Operador) => ({
                modelo: op.modelo,
                nome: op.nome,
                meta: tipoMeta,
                idparticipante: op.idparticipante,
                meta_valor: op.meta_valor.toString(),
                meta_quantidade: op.meta_quantidade,
                premiacao: op.premiacao,
            })),
            itens: marcaProdutos.map((produto) => ({
                metrica: tipoMarcaProduto,
                iditem: produto.codprod,
                nome: produto.nome,
            })),
            escala: escalaData,
        };

        if (
            !campaignData.nome ||
            !campaignData.datainicial ||
            !campaignData.datafinal ||
            !campaignData.valor_total
        ) {
            console.error('Campos obrigatórios ausentes');
            return;
        }

        try {
            await dispatch(
                createCampaign(campaignData as unknown as ICampaign)
            );
            message.success('Campanha criada com sucesso!');
        } catch (error) {
            console.error('Erro ao criar campanha:', error);
            message.error('Erro ao criar campanha');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleSetState = (field: string, value: string) => {
        dispatch(setCurrentCampaign({ [field]: value }));
    };

    const handleSearchFilial = () => {
        dispatch(fetchFiliais());
    };

    const handleEditParticipant = (record: any) => {
        console.log(record)

        setIsEditing(true);
        //setEditingParticipant(participant);
        setSelectedOperador(record.nome);
        setTipoOperador(
            record.modelo === 'teleoperador' ? 'teleoperador' : 'vendedor'
        );
        setTipoMeta(record.tipo_meta || 'VALOR');
        setMetaValor(
            record.tipo_meta === 'VALOR'
                ? record.meta_valor
                : record.meta_quantidade
        );
        setPremiacao(record.premiacao);

    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        //setEditingParticipant(null);
        setSelectedOperador('');
        setMetaValor('');
        setPremiacao('');
    };

    const handleGetExcelFile = async (e: any) => {
        const file = e.target.files[0]
        setFileName(file.name)

        const data = await file.arrayBuffer()
        const workBook = XLSX.readFile(data)
        //vendedor
        const workSheetRCA = workBook.Sheets['RCA']
        const jsonVendedor: any = XLSX.utils.sheet_to_json(workSheetRCA)
        //Emitente/Teleoperador
        const workSheetEmitante = workBook.Sheets['EMITENTE']
        const jsonTeleoperador: any = XLSX.utils.sheet_to_json(workSheetEmitante)
        //Marca
        const workSheetMarca = workBook.Sheets['MARCA']
        const jsonMarca: any = XLSX.utils.sheet_to_json(workSheetMarca)
        //Produto
        const workSheetProduto = workBook.Sheets['PRODUTO']
        const jsonProduto: any = XLSX.utils.sheet_to_json(workSheetProduto)

        setJsonExcelRCA(jsonVendedor)
        setJsonExcelMarca(jsonMarca)
        setJsonExcelProduto(jsonProduto)

        if (tipoMarcaProduto == 'marca') {
            jsonMarca.forEach((item: any) => {
                handleExcelMarca(item)
                //setTipoMarcaProduto('produto')
            })
            setControl2(true)
        } else {
            jsonProduto.forEach((item: any) => {
                handleExcelProdutos(item)
            })
            setControl2(true)
        }

        if (tipoOperador == 'teleoperador') {
            jsonTeleoperador.forEach((item: any) => {
                handleExcelOperador(item)
                //setTipoOperador('vendedor')
            })
        }else{
            jsonVendedor.forEach((item:any) =>{
                handleExcelRCA(item)
            })
        }

        //setTipoOperador('vendedor')
    }

    const handleExcelOperador = (item: any) => {
        //setTipoOperador('teleoperador')
        setSelectedOperador(item.IDCOLABORADOR)
        setMetaValor(item.META)
        setPremiacao(item.PREMIACAO)
        if(tipoOperador == 'teleoperador'){
            console.log(operators)
        }else{
            console.log(vendors)
        }
        if (item) {
            const idparticipante =
                tipoOperador === 'teleoperador'
                    ? operators?.find(
                        (op: Operador) => op.matricula === item.IDCOLABORADOR
                    )?.matricula
                    : operators?.find(
                        (op: Operador) => op.matricula === item.IDCOLABORADOR
                    )?.codusur;

            const nomeOperador = operators?.find((op: Operador) => op.matricula === item.IDCOLABORADOR)?.nome

            if (!idparticipante) {
                message.error('Operador não encontrado!');
                return;
            }

            const participante = {
                modelo:
                    tipoOperador === 'teleoperador' ? 'teleoperador' : 'RCA',
                meta: tipoMeta,
                idparticipante,
                meta_valor: tipoMeta === 'VALOR' ? parseFloat(String(item.META).replace(/\s/g, '').replace('R$', '').replace(/\./g, '').replace(',', '.')) : 0,
                meta_quantidade: tipoMeta === 'QUANTIDADE' ? parseFloat(String(item.META).replace(/\s/g, '').replace('R$', '').replace(/\./g, '').replace(',', '.')) : 0,
                premiacao: String(item.PREMIACAO).replace(/\s/g, '').replace('R$', '').replace(/\./g, '').replace(',', '.'),
                tipo_meta: tipoMeta,
            };

            setOperadores((prev) => [
                ...prev,
                {
                    ...participante,
                    nome: nomeOperador ?? '',
                    tipo: tipoOperador,
                    matricula: idparticipante,
                    codusur: idparticipante,
                },
            ]);

            setSelectedOperador('');
            setMetaValor('');
            setPremiacao('');
        } else {
            message.error('Preencha todos os campos antes de adicionar!');
        }
    }

    const handleExcelRCA = (item: any) => {

        dispatch(fetchOperators({ busca: ' ', type: 'vendedor' }))
        //setTipoOperador('vendedor')
        setControl(false)
        setSelectedOperador(item.IDCOLABORADOR)
        setMetaValor(item.META)
        setPremiacao(item.PREMIACAO)

        if (item) {

            const idparticipante =
                tipoOperador === 'teleoperador'
                    ? vendors?.find(
                        (op: Operador) => op.codusur === item.IDCOLABORADOR
                    )?.matricula
                    : vendors?.find(
                        (op: Operador) => op.codusur === item.IDCOLABORADOR
                    )?.codusur;

            const nomeOperador = vendors?.find((op: Operador) => op.codusur === item.IDCOLABORADOR)?.nome

            if (!idparticipante) {
                message.error('Operador não encontrado!');
                return;
            }

            const participante = {
                modelo:
                    tipoOperador === 'teleoperador' ? 'teleoperador' : 'RCA',
                meta: tipoMeta,
                idparticipante,
                meta_valor: tipoMeta === 'VALOR' ? parseFloat(String(item.META).replace(/\s/g, '').replace('R$', '').replace(/\./g, '').replace(',', '.')) : 0,
                meta_quantidade: tipoMeta === 'QUANTIDADE' ? parseFloat(String(item.META).replace(/\s/g, '').replace('R$', '').replace(/\./g, '').replace(',', '.')) : 0,
                premiacao: String(item.PREMIACAO).replace(/\s/g, '').replace('R$', '').replace(/\./g, '').replace(',', '.'),
                tipo_meta: tipoMeta,
            };

            console.log(participante)

            setOperadores((prev) => [
                ...prev,
                {
                    ...participante,
                    nome: nomeOperador ?? '',
                    tipo: tipoOperador,
                    matricula: idparticipante,
                    codusur: idparticipante,
                },
            ]);

            setSelectedOperador('');
            setMetaValor('');
            setPremiacao('');
            setControl(true)
        } else {
            message.error('Preencha todos os campos antes de adicionar!');
        }
    }

    const handleExcelProdutos = (item: any) => {
        //setTipoMarcaProduto('produto')
        setControl2(false)
                        
        const novosProdutos: { nome: string; codprod: string; descricao: string }[] = [];

        const produto = products?.find(
            (p: any) => String(p.codprod) === String(item.IDPRODUTO)
        );

        if (!produto) {
            message.error(`Produto ${item.IDPRODUTO} não encontrado!`);
            return;
        }

        novosProdutos.push({
            nome: produto.descricao ?? '',
            codprod: String(produto.codprod),
            descricao: produto.descricao,
        });

        setMarcaProdutos((prev) => [...prev, ...novosProdutos]);
    };

    const handleExcelMarca = (item: any) => {
        //setTipoMarcaProduto('marca')
        const produto = marcas?.find(
            (p: any) => String(p.codmarca) === String(item.IDMARCA)
        );

        if (!produto) {
            message.error(`Produto ${item.IDMARCA} não encontrado!`);
            return;
        }

        console.log(produto);

        const marca = {
            nome: produto.marca ?? ' ',
            codprod: String(produto.codmarca),
            descricao: produto.marca,
        };
        setMarcaProdutos((prev) => [...prev, marca]);
        setControl2(false)

    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} />

            {}
            <main
                className={`pt-16 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}
            >
                <div className="p-4">
                    <h1 className="text-xl font-bold text-green-600 mb-4">
                        Cadastro de Campanhas Trade Marketing
                    </h1>

                    <div className="max-w-3xl mx-auto space-y-4">
                        <div className="bg-white p-4 rounded shadow">
                            
                            <h2 className="text-lg font-bold text-green-600">
                                Detalhes da Campanha
                            </h2>
                            <Input
                                placeholder="Nome da Campanha"
                                value={campaignName}
                                onChange={(e) =>
                                    setCampaignName(e.target.value)
                                }
                                className="mb-2"
                            />
                            <Select
                                showSearch
                                placeholder="Filial"
                                className="w-full mb-2"
                                value={idempresa}
                                onChange={(value) => setIdempresa(value)}
                                onSearch={handleSearchFilial}
                                filterOption={false}
                            >
                                {filiais?.map((filial: IFilial) => (
                                    <Option
                                        key={filial.fantasia}
                                        value={filial.fantasia}
                                    >
                                        {filial.fantasia}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        <div className='flex justify-start flex-col items-start'>
                            <Label className='text-sm text-gray-500 ms-3'>Importar Arquivo excel para preenchimento dos dados</Label>
                            <Input className='m-2' type='file' onChange={(e) => handleGetExcelFile(e)} />
                        </div>

                        <div className="bg-white p-4 rounded shadow">
                            <h2 className="text-lg font-bold text-green-600">
                                Adicionar Teleoperador/Vendedor
                            </h2>
                            <div className="flex gap-2 mb-2">
                                <Radio.Group
                                    value={tipoOperador}
                                    onChange={(e) =>
                                        setTipoOperador(e.target.value)
                                    }
                                    className="flex space-x-4"
                                >
                                    <Radio
                                        value="teleoperador"
                                        id="teleoperador"
                                    />
                                    <label
                                        htmlFor="teleoperador"
                                        className="text-sm"
                                    >
                                        Teleoperador
                                    </label>
                                    <Radio value="vendedor" id="vendedor" />
                                    <label
                                        htmlFor="vendedor"
                                        className="text-sm"
                                    >
                                        Vendedor
                                    </label>
                                </Radio.Group>
                            </div>
                            <div className="flex gap-2 mb-2">
                                <Radio.Group
                                    value={tipoMeta}
                                    onChange={(e) =>
                                        setTipoMeta(e.target.value)
                                    }
                                    className="flex space-x-4"
                                >
                                    <Radio value="VALOR" id="valor" />
                                    <label htmlFor="valor" className="text-sm">
                                        Valor
                                    </label>
                                    <Radio value="QUANTIDADE" id="quantidade" />
                                    <label
                                        htmlFor="quantidade"
                                        className="text-sm"
                                    >
                                        Quantidade
                                    </label>
                                </Radio.Group>
                            </div>
                            <div className="flex gap-2 mb-2">
                                <Select
                                    showSearch
                                    className="flex-1"
                                    placeholder={`Buscar ${tipoOperador}...`}
                                    defaultActiveFirstOption={false}
                                    filterOption={false}
                                    onSearch={handleSearchOperador}
                                    onSelect={(_, option) => {
                                        setSelectedOperador(option.nome);
                                    }}
                                    options={(( tipoOperador == 'teleoperador'? operators: vendors) || []).map(
                                        (operator: Operador) => ({
                                            value:
                                                tipoOperador === 'teleoperador'
                                                    ? operator.matricula
                                                    : operator.codusur,
                                            label: tipoOperador == 'teleoperador' ? operator.matricula + " - " + operator.nome : operator.codusur + " - " + operator.nome,
                                            nome: operator.nome,
                                        })
                                    )}
                                />
                            </div>
                            <div className="flex gap-2 mb-2">
                                <Input
                                    placeholder="Nome"
                                    className="flex-1"
                                    value={selectedOperador}
                                    onChange={(e) =>
                                        setSelectedOperador(e.target.value)
                                    }
                                    disabled
                                />
                                <Input
                                    placeholder="Meta"
                                    className="flex-1"
                                    value={meta_valor}
                                    onChange={(e) => {
                                        const inputValue = e.target.value;

                                        setMetaValor(inputValue);
                                    }}
                                />
                                <Input
                                    placeholder="Premiação"
                                    className="flex-1"
                                    value={premiacao}
                                    onChange={(e) => {
                                        const inputValue = e.target.value;

                                        setPremiacao(inputValue);
                                    }}
                                />
                                <Button
                                    className="bg-green-500 hover:bg-green-600"
                                    onClick={handleAddOperador}
                                >
                                    {isEditing ? 'Atualizar' : 'Adicionar'}
                                </Button>
                                {isEditing && (
                                    <Button
                                        className="bg-gray-400 hover:bg-gray-500"
                                        onClick={handleCancelEdit}
                                    >
                                        Cancelar
                                    </Button>
                                )}
                            </div>

                            <Table
                                dataSource={operadores}
                                columns={[
                                    {
                                        title: 'Nome',
                                        dataIndex: 'nome',
                                        key: 'nome',
                                    },
                                    {
                                        title: 'Meta',
                                        key: 'meta',
                                        render: (record: Operador) => {
                                            const value =
                                                record.tipo_meta === 'VALOR'
                                                    ? record.meta_valor
                                                    : record.meta_quantidade;
                                            return parseFloat(
                                                value.toString()
                                            ).toLocaleString('pt-BR');
                                        },
                                    },
                                    {
                                        title: 'Premiação',
                                        dataIndex: 'premiacao',
                                        key: 'premiacao',
                                        render: (text: string) =>
                                            "R$ " + parseFloat(
                                                text.toString()
                                            ).toLocaleString('pt-BR'),
                                    },
                                    {
                                        title: 'Tipo',
                                        dataIndex: 'tipo',
                                        key: 'tipo',
                                    },
                                    {
                                        title: 'Ação',
                                        key: 'acao',
                                        render: (_, record, index) => (
                                            <div className="flex space-x-2">

                                                {/*<Button
                                                    className="bg-blue-500 hover:bg-blue-600 p-1"
                                                    onClick={() =>
                                                        handleEditParticipant(
                                                            record
                                                        )
                                                    }
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="w-4 h-4"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                                        />
                                                    </svg>
                                                </Button>*/}

                                                <Button
                                                    className="bg-red-500 hover:bg-red-600"
                                                    onClick={() =>
                                                        handleRemoveOperador(index)
                                                    }
                                                >
                                                    Remover
                                                </Button>
                                            </div>
                                        ),
                                    },
                                ]}
                                rowKey="idparticipante"
                                pagination={false}
                            />
                        </div>

                        <div className="bg-white p-4 rounded shadow">
                            <h2 className="text-lg font-bold text-green-600">
                                Adicionar Marca/Produto
                            </h2>

                            <div className="flex gap-2 mb-2">
                                <Radio.Group
                                    value={tipoMarcaProduto}
                                    onChange={(e) =>
                                        setTipoMarcaProduto(e.target.value)
                                    }
                                    className="flex space-x-4"
                                >
                                    <Radio value="marca" id="marca" />
                                    <label htmlFor="marca" className="text-sm">
                                        Marca
                                    </label>
                                    <Radio value="produto" id="produto" />
                                    <label
                                        htmlFor="produto"
                                        className="text-sm"
                                    >
                                        Produto
                                    </label>
                                </Radio.Group>
                            </div>
                            <div className="flex gap-2 mb-2">
                                <Select
                                    showSearch
                                    className="flex-1"
                                    placeholder={`Buscar ${tipoMarcaProduto}...`}
                                    defaultActiveFirstOption={false}
                                    filterOption={false}
                                    onSearch={handleSearchProduto}
                                    onSelect={(_, option) => {
                                        handleAddMarcaProduto(
                                            option.label as string,
                                            option.value as string,
                                            option.label as string
                                        );
                                    }}
                                    options={( (tipoMarcaProduto == 'marca' ? marcas :  products) || []).map(
                                        (product: IProduct) => ({
                                            value:
                                                tipoMarcaProduto === 'produto'
                                                    ? product.codprod
                                                    : product.codmarca,
                                            label:
                                                tipoMarcaProduto === 'produto'
                                                    ? product.codprod + " - " + product.descricao
                                                    : product.codmarca + " - " + product.marca,
                                        })
                                    )}
                                />
                            </div>
                            <Table
                                dataSource={marcaProdutos}
                                columns={[
                                    {
                                        title: 'Código',
                                        dataIndex: 'codprod',
                                        key: 'codprod',
                                    },
                                    {
                                        title: 'Descrição',
                                        dataIndex: 'descricao',
                                        key: 'descricao',
                                    },
                                    {
                                        title: 'Ação',
                                        key: 'acao',
                                        render: (_, __, index) => (
                                            <Button
                                                className="bg-red-500 hover:bg-red-600"
                                                onClick={() =>
                                                    handleRemoveMarcaProduto(
                                                        index
                                                    )
                                                }
                                            >
                                                Remover
                                            </Button>
                                        ),
                                    },
                                ]}
                                rowKey="nome"
                                pagination={false}
                            />
                        </div>

                        <div className="bg-white p-4 rounded shadow">
                            <h2 className="text-lg font-bold text-green-600">
                                Período da Campanha
                            </h2>
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    className="flex-1"
                                    value={currentCampaign?.datainicial}
                                    onChange={(e) =>
                                        handleSetState(
                                            'datainicial',
                                            e.target.value
                                        )
                                    }
                                />
                                <Input
                                    type="date"
                                    className="flex-1"
                                    value={currentCampaign?.datafinal}
                                    onChange={(e) =>
                                        handleSetState(
                                            'datafinal',
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded shadow">
                            <h2 className="text-lg font-bold text-green-600">
                                Valor da Meta Geral
                            </h2>
                            <Input
                                placeholder="Meta Geral"
                                value={currentCampaign?.valor_total}
                                onChange={(e) => {
                                    const inputValue = e.target.value;

                                    handleSetState('valor_total', inputValue.replace(/\s/g, '').replace('R$', '').replace(/\./g, '').replace(',', '.'));
                                }}
                            />
                        </div>

                        <div className="bg-white p-4 rounded shadow">
                            <h2 className="text-lg font-bold text-green-600">
                                Escala
                            </h2>
                            <MetaTable
                                isEditing={true}
                                onEscalaSubmit={(formattedMetas: IEscala[]) => {
                                    handleEscalaSubmit(
                                        formattedMetas as unknown as Escala[]
                                    );
                                }}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button
                                className="bg-green-500 hover:bg-green-600"
                                onClick={handleSaveCampaign}
                            >
                                Salvar Campanha
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
