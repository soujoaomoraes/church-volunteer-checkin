import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, UserMinus, Clock, Search, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CheckOut = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVolunteer, setSelectedVolunteer] = useState<any>(null);
  const [itensDevolvidos, setItensDevolvidos] = useState<string[]>([]);

  // Mock data - In real app, this would come from API
  const mockVolunteers = [
    {
      id: 123,
      nome: "João Silva",
      telefone: "(11) 99999-9999",
      sessao: "1º Culto (Manhã)",
      data: "2025-08-24",
      hora: "14:30:00",
      itens: ["Crachá de Identificação", "Rádio Comunicador", "Chaves (Portões/Salas)"]
    },
    {
      id: 124,
      nome: "Maria Santos",
      telefone: "(11) 88888-8888", 
      sessao: "2º Culto (Tarde)",
      data: "2025-08-24",
      hora: "15:00:00",
      itens: ["Equipamento de Som", "Material de Limpeza"]
    }
  ];

  const handleSearch = async () => {
    if (searchTerm.length < 2) return;
    
    setSearchLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const found = mockVolunteers.find(v => 
        v.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (found) {
        setSelectedVolunteer(found);
        setItensDevolvidos([]);
      } else {
        setSelectedVolunteer(null);
        toast({
          title: "Voluntário não encontrado",
          description: "Nenhum check-in pendente encontrado para este nome.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro na busca",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 2) {
        handleSearch();
      } else {
        setSelectedVolunteer(null);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleItemChange = (item: string, checked: boolean) => {
    if (checked) {
      setItensDevolvidos(prev => [...prev, item]);
    } else {
      setItensDevolvidos(prev => prev.filter(i => i !== item));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVolunteer || itensDevolvidos.length === 0) return;
    
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const itensNaoDevolvidos = selectedVolunteer.itens.filter(
        (item: string) => !itensDevolvidos.includes(item)
      );

      toast({
        title: "Check-out realizado com sucesso!",
        description: `${selectedVolunteer.nome} devolveu ${itensDevolvidos.length} item(ns)`,
      });

      if (itensNaoDevolvidos.length > 0) {
        toast({
          title: "Itens pendentes",
          description: `${itensNaoDevolvidos.length} item(ns) ainda não foram devolvidos`,
          variant: "default"
        });
      }

      // Reset form
      setSearchTerm("");
      setSelectedVolunteer(null);
      setItensDevolvidos([]);

    } catch (error) {
      toast({
        title: "Erro no check-out",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/")}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <UserMinus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Check-out</h1>
              <p className="text-sm text-muted-foreground">Registrar saída</p>
            </div>
          </div>
        </div>

        {/* Current Time */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{new Date().toLocaleString('pt-BR')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Search Volunteer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Buscar Voluntário</CardTitle>
            <CardDescription>
              Digite o nome para localizar o check-in pendente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Nome do voluntário
              </Label>
              <div className="relative">
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite o nome..."
                  className="h-12"
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Volunteer Info */}
            {selectedVolunteer && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{selectedVolunteer.nome}</p>
                    <p className="text-sm text-muted-foreground">{selectedVolunteer.telefone}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{selectedVolunteer.data}</p>
                    <p>{selectedVolunteer.hora}</p>
                  </div>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Sessão: </span>
                  <span className="text-muted-foreground">{selectedVolunteer.sessao}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Return Items */}
        {selectedVolunteer && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Devolver Itens</CardTitle>
              <CardDescription>
                Marque os itens que estão sendo devolvidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  {selectedVolunteer.itens.map((item: string) => (
                    <div key={item} className="flex items-center space-x-3">
                      <Checkbox
                        id={item}
                        checked={itensDevolvidos.includes(item)}
                        onCheckedChange={(checked) => 
                          handleItemChange(item, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={item} 
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {item}
                      </Label>
                    </div>
                  ))}
                </div>

                {/* Warning for pending items */}
                {selectedVolunteer.itens.length > itensDevolvidos.length && itensDevolvidos.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {selectedVolunteer.itens.length - itensDevolvidos.length} item(ns) 
                      permanecerão pendentes de devolução.
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  variant="default"
                  className="w-full h-12"
                  disabled={itensDevolvidos.length === 0 || loading}
                >
                  {loading ? "Registrando..." : "Confirmar Check-out"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CheckOut;