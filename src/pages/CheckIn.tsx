import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, UserPlus, Clock, Phone, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const CheckIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    sessao: "",
    itens: [] as string[],
    outrosItens: ""
  });

  const sessoes = [
    "1º Culto (Manhã)",
    "2º Culto (Tarde)",
    "3º Culto (Noite)",
    "Ensaio",
    "Evento Especial",
    "Reunião de Liderança"
  ];

  const itensDisponiveis = [
    "Crachá de Identificação",
    "Rádio Comunicador",
    "Chaves (Portões/Salas)",
    "Equipamento de Som",
    "Material de Limpeza",
    "Instrumentos Musicais",
    "Material de Decoração",
    "Outros"
  ];

  const handleItemChange = (item: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        itens: [...prev.itens, item]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        itens: prev.itens.filter(i => i !== item)
      }));
    }
  };

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefone(e.target.value);
    setFormData(prev => ({ ...prev, telefone: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Check-in realizado com sucesso!",
        description: `${formData.nome} foi registrado para ${formData.sessao}`,
      });

      // Reset form
      setFormData({
        nome: "",
        telefone: "",
        sessao: "",
        itens: [],
        outrosItens: ""
      });

    } catch (error) {
      toast({
        title: "Erro no check-in",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isValidForm = formData.nome.length >= 2 && 
                     formData.telefone.replace(/\D/g, '').length === 11 && 
                     formData.sessao;

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
            <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-success" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Check-in</h1>
              <p className="text-sm text-muted-foreground">Registrar entrada</p>
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

        {/* Check-in Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados do Voluntário</CardTitle>
            <CardDescription>
              Preencha as informações para registrar sua entrada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nome completo *
                </Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Digite seu nome completo"
                  className="h-12"
                />
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="telefone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefone *
                </Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={handleTelefoneChange}
                  placeholder="(11) 99999-9999"
                  className="h-12"
                />
              </div>

              {/* Sessão */}
              <div className="space-y-2">
                <Label>Sessão/Evento *</Label>
                <Select value={formData.sessao} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, sessao: value }))
                }>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecione a sessão" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessoes.map((sessao) => (
                      <SelectItem key={sessao} value={sessao}>
                        {sessao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Itens */}
              <div className="space-y-3">
                <Label>Itens retirados</Label>
                <div className="grid grid-cols-1 gap-3">
                  {itensDisponiveis.map((item) => (
                    <div key={item} className="flex items-center space-x-3">
                      <Checkbox
                        id={item}
                        checked={formData.itens.includes(item)}
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
                
                {/* Campo Outros Itens */}
                {formData.itens.includes("Outros") && (
                  <div className="mt-3">
                    <Input
                      value={formData.outrosItens}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        outrosItens: e.target.value 
                      }))}
                      placeholder="Descreva outros itens retirados"
                      className="h-12"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                variant="success"
                className="w-full h-12"
                disabled={!isValidForm || loading}
              >
                {loading ? "Registrando..." : "Confirmar Check-in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckIn;